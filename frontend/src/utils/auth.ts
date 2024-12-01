// Password must be 8 characters minimum and a mix of alphanumeric lower and upper case characters + special characters.

function validatePassword(password: string) {
  // Check if password is at least 8 characters long
  if (password.length < 8) {
    return false
  }

  // Check if password contains at least one uppercase letter, one lowercase letter, one digit, and one special character
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

export { validatePassword }
