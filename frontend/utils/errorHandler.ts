export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { status?: number; data?: { message?: string } } }
    const status = err.response?.status
    const data = err.response?.data

    switch (status) {
      case 400:
        return data?.message || 'Bad Request: Please check your input.'
      case 401:
        return 'Unauthorized: Please login again.'
      case 403:
        return 'Forbidden: You do not have permission.'
      case 404:
        return data?.message || 'Resource not found.'
      case 500:
        return 'Internal Server Error: Please try again later.'
      default:
        return data?.message || 'An unexpected error occurred.'
    }
  } else if (error && typeof error === 'object' && 'request' in error) {
    return 'Network Error: Cannot reach the server. Please check your connection.'
  } else if (error instanceof Error) {
    return error.message
  } else {
    return 'Something went wrong while preparing the request.'
  }
}
