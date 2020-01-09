import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import './uploader.scss';

import {image64toCanvasRef, downloadBase64File, extractImageFileExtensionFromBase64, base64StringtoFile} from './ReusableUtils.js';

const imageMaxSize = 1000000000;
const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpeg, image/gif';

class RhCropper extends Component {
    constructor (props) {
        super(props)
        this.state = {
            hovering: false,
            imgSrc: null,
            croppedURL: null,
            crop: {
                x: 20,
                y: 10,
                width: 40,
                height: 40
            }
        }
    }

    handleToggleDrag = () => {
        this.setState({
            hovering: !this.state.hovering
        })
    }

    verifyFile = (files) => {
        if (files && files.length > 0){
            const currentFile = files[0]
            const currentFileType = currentFile.type
            const currentFileSize = currentFile.size
            if(currentFileSize > imageMaxSize) {
                alert("This file is not allowed. " + currentFileSize + " bytes is too large")
                return false
            }
            if (!acceptedFileTypes.includes(currentFileType)){
                alert("This file is not allowed. Only images are allowed.")
                return false
            }
            return true
        }
    }

    handleDrop = (files, rejectedFiles) => {
        if (rejectedFiles && rejectedFiles.length > 0){
            this.verifyFile(rejectedFiles);
        }

        if (files && files.length > 0){
            const isVerified = this.verifyFile(files);
            if (isVerified){
            const currentFile = files[0]
                 const myFileItemReader = new FileReader();
                 myFileItemReader.addEventListener("load", () => {
                     const myResult = myFileItemReader.result
                     this.setState({
                         imgSrc: myResult,
                         imageType: currentFile.type,
                     })
                 }, false)
                 myFileItemReader.readAsDataURL(currentFile)
            }
        }
    }

    onCropChange = (crop) => {
        this.setState({ crop });
    }

    onImageLoaded = (image, pixelCrop) => {
        this.imageRef = image;
        const { crop } = this.state;
        if (crop.aspect && crop.height && crop.width) {
          this.setState({
            crop: { ...crop, height: null },
          });
        } else {
          this.makeClientCrop(crop, pixelCrop);
        }
    }

    onCropComplete = (crop, pixelCrop) => {
        this.makeClientCrop(crop, pixelCrop);
    }

    async makeClientCrop(crop, pixelCrop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedURL = await this.getCroppedImg(
                this.imageRef,
                pixelCrop,
                'newFile.jpeg',
            );
            this.setState({ croppedURL });
        }
    }

    getCroppedImg = (image, pixelCrop, fileName) => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve, reject) => {
            resolve(canvas.toDataURL());
        });
    }

    render(){
        const { hovering, imgSrc} = this.state;
        return(
            <div className="rhContainer">
                {
                    imgSrc !== null?
                        <div>
                            <img src={imgSrc}/>
                        </div>
                        :
                        <Dropzone
                            onDrop={this.handleDrop}
                            accept={acceptedFileTypes}
                            multiple={false}
                            maxSize={imageMaxSize}
                            onDragOver={this.handleToggleDrag}
                            onDragLeave={this.handleToggleDrag}
                        >
                            {({getRootProps, getInputProps}) => (
                                <section id="dropzoneSection">
                                <div id="dropzone" {...getRootProps()} className={hovering? 'hovering': ''}>
                                <input {...getInputProps()} />
                                <button className="btn btn-theme-color">Drag 'n' drop some files here, or click to select files</button>
                                </div>
                                </section>
                            )}
                        </Dropzone>

                }
            </div>
        )
    }

}

export default RhCropper;
