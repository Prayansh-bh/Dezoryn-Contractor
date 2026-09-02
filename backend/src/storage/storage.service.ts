import * as localStorage from "./local-storage.service";

export interface IStorageService {
  saveMediaFile(fileName: string, buffer: ArrayBuffer | Buffer): Promise<{ objectKey: string; localPath: string }>;
  getMediaFile(objectKey: string): Promise<Buffer | null>;
  deleteMediaFile(objectKey: string): Promise<boolean>;
}

export const storageService: IStorageService = {
  saveMediaFile: localStorage.saveMediaFile,
  getMediaFile: localStorage.getMediaFile,
  deleteMediaFile: localStorage.deleteMediaFile,
};

export default storageService;
