import { ffprobe } from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'

const getMetadata = async videoFile => {
  return await new Promise((resolve, reject) => {
    console.log(videoFile)
    ffprobe(videoFile, (err, metadata) => resolve(metadata.streams[0]))
  })
}

export const getWidthxHeight = async videoFile => {
  return await new Promise((resolve, reject) => {
    ffprobe(videoFile, (err, metadata) => {
      const { width, height } = metadata.streams[0]
      resolve({ width, height })
    })
  })
}

const createFFmpegProcess = (command, args) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting ${args.name}`)
    const process = spawn('ffmpeg', args.value)
    process.stdout.on('data', data => console.log(data.toString()))
    process.stderr.on('data', error => console.error(error.toString()))
    process.on('exit', () => {
      console.log(`${args.name} finished`)
      resolve()
    })
  })
}

export const decomposeVideo = async videoFile => {
  const intermediateDir = `${videoFile.slice(0,-4)}`
  if (!fs.existsSync(intermediateDir)) fs.mkdirSync(intermediateDir)
  const imageNameFormat = `${intermediateDir}/%d.jpg`
  const audioFile = `${intermediateDir}/audio.mp3`

  const vidToImg = {
    name: 'videoToImg',
    value: ['-hide_banner', '-i', videoFile, imageNameFormat]
  }
  const vidToAudio = {
    name: 'vidToAudio',
    value: ['-hide_banner', '-i', videoFile, '-vn', '-ar', '44100', '-ac', '2', '-ab', '192k', '-f', 'mp3', audioFile]
  }

  return await Promise.map([vidToImg, vidToAudio], args => {
    return createFFmpegProcess('ffmpeg', args)
  })
}

export const constructVideo = async videoFile => {
  const intermediateDir = `${videoFile.slice(0,-4)}`
  const imageNameFormat = `${intermediateDir}/%d.jpg`
  const audioFile = `${intermediateDir}/audio.mp3`
  const videoOutNoSound = `${intermediateDir}/vidNoSound.mp4`
  const finalVideo = `${intermediateDir}/video.mp4`

  const metaData = await getMetadata(videoFile)
  const { nb_frames, duration, width, height, pix_fmt, bit_rate } = metaData
  const fps = nb_frames / duration

  const imagesToVideo = {
    name: 'imagesToVideo',
    value: ['-hide_banner', '-r', fps, '-f', 'image2', '-s', `${width}x${height}`, '-i', imageNameFormat, '-vcodec', 'libx264', '-b:v', bit_rate, '-pix_fmt', pix_fmt, videoOutNoSound]
  }
  const combineVideoAndAudio = {
    name: 'combineVideoAndAudio',
    value: ['-hide_banner', '-i', audioFile, '-i', videoOutNoSound, finalVideo]
  }

  return await Promise.mapSeries([imagesToVideo, combineVideoAndAudio], args => {
    return createFFmpegProcess('ffmpeg', args)
  }).then(() => finalVideo)
}
