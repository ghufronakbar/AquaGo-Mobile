export interface Api<T = undefined> {
  message: string;
  data: T;
}

export interface ImageResponse {
  secure_url: string;
}
