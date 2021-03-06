import { HttpClient, HttpStatusCode } from '@/data/protocols/http';

import { Authentication } from '@/domain/usecases';
import {
  InvalidCredentialsError,
  UnexpectedError,
  TooManyRequestsError,
  AccessDeniedError
} from '@/domain/errors';

export class RemoteAuthentication implements Authentication {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteAuthentication.Model>
  ) {}

  async auth (params: Authentication.Params): Promise<Authentication.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: 'POST',
      body: params
    });

    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok: return params;
      case HttpStatusCode.badRequest: {
        if (params.attempts === 3) {
          throw new TooManyRequestsError();
        } else {
          throw new InvalidCredentialsError();
        }
      }
      case HttpStatusCode.unauthorized: throw new AccessDeniedError();
      default: throw new UnexpectedError();
    }
  }
}

export namespace RemoteAuthentication {
  export type Model = Authentication.Model;
}