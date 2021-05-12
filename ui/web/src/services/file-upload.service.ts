import { Injectable } from "@angular/core";

import { environment } from "../environments/environment";

import { FileUploader } from "ng2-file-upload";

@Injectable()
export class FileUploadService {
  constructor() {}

  getUploader(folder) {
    return new FileUploader({
      url: environment.apiurl + "/FileAttachments/" + folder + "/upload",
      autoUpload: true
    });
  }

  getImgUploader(folder) {
    return new FileUploader({
      url: environment.apiurl + "/FileAttachments/" + folder + "/upload",
      autoUpload: true,
      allowedFileType: ['image']
    });
  }

  getProgramBannerUploader(folder) {
    return new FileUploader({
      url: environment.apiurl + "/FileAttachments/" + folder + "/upload",
      autoUpload: true,
      allowedFileType: ['image']
    });
  }
}
