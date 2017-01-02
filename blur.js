import { blurFacesInVideo } from './src/ImageUtil'
import { getWidthxHeight, decomposeVideo, constructVideo } from './src/VideoUtil'

// babel-node blur.js src_video reference_image
const args = process.argv.reduce((argList, arg) => {
  argList.push(arg)
  return argList
}, []);

const video = {
  src: args[2],
  resolution: null
}

const getResolution = async videoFile => {
  const resolution = await getWidthxHeight(videoFile)
  video.resolution = resolution
  console.log(video)
}

getResolution(args[2]).then(()=>
decomposeVideo(video.src).then(() =>
blurFacesInVideo(args[3], video)).then(() =>
constructVideo(video.src)))
