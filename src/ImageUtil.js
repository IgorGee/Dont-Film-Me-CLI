import StackBlur from 'stackblur-canvas'
import { Canvas, Image } from 'canvas'
import fs from 'fs'
import * as Api from './Api'

const blurImage = (file, videoResolution, face, radiusBlur=70) => {
  const canvasOriginal = new Canvas(videoResolution.width, videoResolution.height)
  const canvasBlur = new Canvas(videoResolution.width, videoResolution.height)
  const ctxOriginal = canvasOriginal.getContext('2d')
  const ctxBlur = canvasBlur.getContext('2d')

  fs.readFile(file, (err, data) => {
    if (err) console.error(err)

    const img = new Image()
    img.src = data

    ctxOriginal.drawImage(img, 0, 0, img.width, img.height)
    ctxBlur.drawImage(img, 0, 0, img.width, img.height)

    const imageData = ctxOriginal.getImageData(face.x, face.y, face.width, face.height)
    StackBlur.imageDataRGBA(imageData, face.x, face.y, face.width, face.height, radiusBlur)
    ctxBlur.putImageData(imageData, face.x, face.y)
    const stream = canvasBlur.createJPEGStream({ bufsize: 2048, quality: 1 })
    const out = fs.createWriteStream(file)
    stream.on('data', chunk => out.write(chunk))
  })
}

let intermediateDir
const getNthImage = n => `./${intermediateDir}/${n}.jpg`

export const blurFacesInVideo = async (referenceImage, video, start=1, end=190, frequency=25) => {
  return await new Promise(async (resolve, reject) => {
    intermediateDir = `${video.src.slice(0,-4)}`
    const refLink = await Api.getImgurLink(referenceImage)
    let refFaceId = await Api.getReferenceFace(refLink)
    refFaceId = refFaceId[0].faceId
    console.log(refFaceId)
    const candidates = {}

    for (let i = start; i < end - frequency; i+=frequency) {
      const frameLink = await Api.getImgurLink(getNthImage(i))
      const faces = await Api.getFaces(frameLink)
      for (let j = 0; j < faces.length; j++) {
        const id = faces[j].faceId
        const rectangle = faces[j].faceRectangle
        candidates[id] = { frame: i, rectangle }
      }
    }

    const candidateFaceIds = Object.keys(candidates)
    console.log('CandidateFaceIds', candidateFaceIds)
    const matches = await Api.getComparison(refFaceId, candidateFaceIds)
    console.log('Matches', matches)

    for (let i = 0; i < matches.length; i++) {
      const id = matches[i].faceId
      const { frame, rectangle } = candidates[id]
      const face = {
        x: rectangle.left,
        y: rectangle.top,
        width: rectangle.width + 50,
        height: rectangle.height + 50
      }

      const startFrame = frame > 5 ? frame - 5 : frame
      for (let i = startFrame; i < frame + 25; i++) {
        blurImage(getNthImage(i), video.resolution, face)
      }
    }
    resolve()
  })
}
