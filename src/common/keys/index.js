
export const UserEmailKey = ({ email, subject }) => {
    return `USER ::${email}::${subject}::OTP`
}

export const UserEmailTrialsKey = ({ email, subject }) => {
    return `${UserEmailKey({ email, subject })}::Trials`
}

export const UserEmailLoginTrialsKey = ({ email, subject }) => {
    return `${UserEmailKey({ email, subject })}::LoginTrials`
}

export const resetPasswordKey = (resetToken) => {
    return `RESET_PASSWORD :: ${resetToken}`
}