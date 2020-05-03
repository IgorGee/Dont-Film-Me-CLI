[ccccOriginal]: https://media.giphy.com/media/WqcnRhHmfdMAKZwd3V/giphy.gif "CCCC Original"
[ccccOne]: https://media.giphy.com/media/PnfmC0WEwI8S87fmoh/giphy.gif "CCCC One"
[ccccTwo]: https://media.giphy.com/media/kbcOK6hrefZlibuBTc/giphy.gif "CCCC Two"
[trumpOriginal]: https://media.giphy.com/media/iDt2eXHh3STin5nF07/giphy.gif "Trump Original"
[trumpBlur]: https://media.giphy.com/media/chtIvhys8lRwKyhygL/giphy.gif "trumpBlur"

[reff]: http://i.imgur.com/b6CbKeq.png "Female Reference"
[refm]: http://i.imgur.com/ePWGgnv.png "Male Reference"
[trump]: http://i.imgur.com/E6kxkWi.png "Trump Reference"

# Don't Film Me!

Many people are sensitive to their faces being shown publicly on video without
their consent. Cinematographers often need to have subjects within the video
to sign a release form of some sort, which can be a hassle at times, and
perhaps unnecessary for the purposes of their video. A good solution to avoiding
this hassle is to simply blur the subject’s face from the post-production
footage. However, this is often a tedious task that usually requires manual
work. Automating this task will make the life of video editors much simpler,
and save them a significant amount of time.

The goal of **Don't Film Me** is to provide a tool to assist with this task of
blurring by automating the process.

## How it works

1. Get a `reference` face
2. Break the video down into images and audio
3. Compare one image against the `reference` face every `f` images
  - `f`: frequency of frame analysis
  - Analysis is done via [Microsoft Cognitive Services Vision API](Microsoft Cognitive Services Vision API)

4. Blur the face region of the image for `f` frames if there is a match
  - A neat optimization would be blur the previous 5 or 10 frames as well as
    the following 5-10 frames. This usually ensures full coverage throughout the
    video.
  - The blurring is done via the [StackBlur Algorithm](https://github.com/flozz/StackBlur), which is an amazing
    blurring algorithm. It's similar to Gaussian, but is 7x faster, making it
    a very viable option to use as a real-time tool.
5. Stitch the images and audio back together. Et voila!

## Usage

`babel-node blur.js <video_file> <reference_image>`

## Demos

#### [Cutesy Couple Christmas Card](https://www.youtube.com/watch?v=LU-Jgn7HKNQ)
![ccccOriginal]

#### Reference Images
![refm]
![reff]

#### Blurring One Person
![ccccOne]

#### Blurring Two People
![ccccTwo]

#### [400 Pound Hackers](https://www.youtube.com/watch?v=XfVce4rELAY)
![trumpOriginal]

#### Reference Image
![trump]

#### Blurred Result
![trumpBlur]
