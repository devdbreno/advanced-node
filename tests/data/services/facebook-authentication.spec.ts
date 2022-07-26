import { mock, MockProxy } from 'jest-mock-extended'

import { AuthenticationError } from '@/domain/errors'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { FacebookAuthenticationService } from '@/data/services'
import { LoadUserAccountRepository, CreateFacebookUserAccountRepository } from '@/data/contracts/repositories'

describe('FacebookAuthenticationService', () => {
  const token = 'any-token'

  let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>
  let loadUserAccountRepository: MockProxy<LoadUserAccountRepository>
  let createFacebookUserAccountRepository: MockProxy<CreateFacebookUserAccountRepository>
  let sut: FacebookAuthenticationService

  beforeEach(() => {
    loadFacebookUserApi = mock()
    loadUserAccountRepository = mock()
    createFacebookUserAccountRepository = mock()

    loadFacebookUserApi.loadUser.mockResolvedValueOnce({
      name: 'any-facebook-name',
      email: 'any-facebook-email',
      facebookId: 'any-facebook-id'
    })

    sut = new FacebookAuthenticationService(
      loadFacebookUserApi,
      loadUserAccountRepository,
      createFacebookUserAccountRepository
    )
  })

  it('Shoud call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })

    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({ token })
    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('Should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined)

    const hasAuthenticationError = await sut.perform({ token })

    expect(hasAuthenticationError).toEqual(new AuthenticationError())
  })

  it('Should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.perform({ token })

    expect(loadUserAccountRepository.load).toHaveBeenCalledWith({ email: 'any-facebook-email' })
    expect(loadUserAccountRepository.load).toHaveBeenCalledTimes(1)
  })

  it('Should call CreateUserAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    loadUserAccountRepository.load.mockResolvedValueOnce(undefined)

    await sut.perform({ token })

    expect(createFacebookUserAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      name: 'any-facebook-name',
      email: 'any-facebook-email',
      facebookId: 'any-facebook-id'
    })
    expect(createFacebookUserAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1)
  })
})
