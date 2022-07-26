import { AuthenticationError } from '@/domain/errors'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { FacebookAuthentication } from '@/domain/features'
import { LoadUserAccountRepository, CreateFacebookUserAccountRepository } from '@/data/contracts/repositories'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & CreateFacebookUserAccountRepository
  ) {}

  public async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookUserData = await this.facebookApi.loadUser(params)

    if (facebookUserData !== undefined) {
      await this.userAccountRepository.load({ email: facebookUserData.email })
      await this.userAccountRepository.createFromFacebook(facebookUserData)
    }

    return new AuthenticationError()
  }
}
