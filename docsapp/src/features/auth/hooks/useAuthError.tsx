import { useSearchParams } from 'next/navigation'

import errorData from '../data/authData.json'
import { AUTH_CODE, AUTH_QUERY } from '../utils/constants'

const ERR_DEFAULT = 'defaultValue'

type ErrDataType = Record<string, {
  code: string;
  title: string;
  info: string;
}>

export const useAuthError = () => {
  const searchParams = useSearchParams()

  const queryCode = searchParams.get(AUTH_QUERY.CODE) ?? '-'
  const queryError = searchParams.get(AUTH_QUERY.ERROR) ?? '-'
  const queryCallbackURL = searchParams.get(AUTH_QUERY.CALLBACK_URL) ?? '/'

  let message

  const messages = errorData.reduce((acc, item) => {
    acc[item.code] = {
      code: item.code,
      title: item.title,
      info: item.info,
    }

    return acc
  }, {} as ErrDataType)

  switch (queryCode) {
  case AUTH_CODE.SIGN_IN:
    message = messages[AUTH_CODE.SIGN_IN] ?? messages[ERR_DEFAULT]
    break

  default:
    message = messages[queryError] ?? messages[ERR_DEFAULT]
    break
  }

  return {
    errorCode: message?.title ?? '-',
    errorInfo: message?.info ?? '-',
    callbackURL: queryCallbackURL ?? '/',
  }
}
