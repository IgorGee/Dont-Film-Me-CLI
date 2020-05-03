import imgur from 'imgur'
import axios from 'axios'

(() => {
  imgur.setAPIUrl('https://api.imgur.com/3/')

  axios.defaults.baseURL = 'https://eastus.api.cognitive.microsoft.com/face/v1.0/'
  axios.defaults.headers.common['Ocp-Apim-Subscription-Key'] = '<YOUR_API_KEY>'
})()

export const getImgurLink = async file => {
  try {
    const { data: { link } } = await imgur.uploadFile(file)
    console.log(link)
    return link
  } catch (err) {
    console.log("getImgurLink failed")
    console.dir(err)
  }
}

export const getReferenceFace = async link => {
  try {
    const { data: faces } = await axios.post('/detect?returnFaceId=true', {
      url: link
    })

    if (faces.length > 1) throw "Too many faces detected"
    else return faces
  } catch (err) {
    console.log("getReferenceFace failed")
    console.dir(err)
  }
}

export const getFaces = async link => {
  try {
    const { data: faces } = await axios.post('/detect?returnFaceId=true', {
      url: link
    })
    return faces
  } catch (err) {
    console.log("getFaces failed")
    console.dir(err)
  }
}

export const getComparison = async (queryFaceId, candidateFaceIds, maxReturn=1000) => {
  try {
    const { data: matches } = await axios.post('/findsimilars', {
      faceId: queryFaceId,
      faceIds: candidateFaceIds,
      maxNumOfCandidatesReturned: maxReturn
    })
    console.log(matches)
    return matches
  } catch (err) {
    console.log("getComparison failed")
    console.dir(err.response.data)
  }
}
