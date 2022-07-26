import { AuthenticationError } from '@/domain/errors'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { FacebookAuthentication } from '@/domain/features'
import { LoadUserAccountRepository, CreateFacebookUserAccountRepository } from '@/data/contracts/repositories'

export class FacebookAuthenticationService {
  constructor (
    private readonly loadFacebookUserApi: LoadFacebookUserApi,
    private readonly loadUserAccountRepository: LoadUserAccountRepository,
    private readonly createFacebookUserAccountRepository: CreateFacebookUserAccountRepository
  ) {}

  public async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookUserData = await this.loadFacebookUserApi.loadUser(params)

    if (facebookUserData !== undefined) {
      await this.loadUserAccountRepository.load({ email: facebookUserData.email })
      await this.createFacebookUserAccountRepository.createFromFacebook(facebookUserData)
    }

    return new AuthenticationError()
  }
}
