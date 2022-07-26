import { mock, MockProxy } from 'jest-mock-extended'

import { AuthenticationError } from '@/domain/errors'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { FacebookAuthenticationService } from '@/data/services'
import { LoadUserAccountRepository, CreateFacebookUserAccountRepository } from '@/data/contracts/repositories'

describe('FacebookAuthenticationService', () => {
  const token = 'any-token'

  let facebookApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepository: MockProxy<LoadUserAccountRepository & CreateFacebookUserAccountRepository>
  let sut: FacebookAuthenticationService

  beforeEach(() => {
    facebookApi = mock()
    userAccountRepository = mock()

    facebookApi.loadUser.mockResolvedValueOnce({
      name: 'any-facebook-name',
      email: 'any-facebook-email',
      facebookId: 'any-facebook-id'
    })

    sut = new FacebookAuthenticationService(facebookApi, userAccountRepository)
  })

  it('Shoud call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })

    expect(facebookApi.loadUser).toHaveBeenCalledWith({ token })
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('Should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)

    const hasAuthenticationError = await sut.perform({ token })

    expect(hasAuthenticationError).toEqual(new AuthenticationError())
  })

  it('Should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.perform({ token })

    expect(userAccountRepository.load).toHaveBeenCalledWith({ email: 'any-facebook-email' })
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1)
  })

  it('Should call CreateUserAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    userAccountRepository.load.mockResolvedValueOnce(undefined)

    await sut.perform({ token })

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      name: 'any-facebook-name',
      email: 'any-facebook-email',
      facebookId: 'any-facebook-id'
    })
    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1)
  })
})
