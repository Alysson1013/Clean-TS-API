import { AddAccount } from './../../domain/usecases/add-account'
import { MissingParamError, InvalidParamError } from '../errors'
import { badRequest, serverError } from '../helpers/http-helper'
import { EmailValidator, HttpResponse, HttpRequest, Controller } from '../protocols'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly addAccount: AddAccount

  constructor (emailValidator: EmailValidator, AddAccount: AddAccount) {
    this.emailValidator = emailValidator
    this.addAccount = AddAccount
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFiels = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFiels) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }
      const isValid = this.emailValidator.isValid(email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }
      this.addAccount.add({
        name,
        email,
        password
      })
    } catch (error) {
      return serverError()
    }
  }
}
