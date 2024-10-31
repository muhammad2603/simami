$(() => {
    const btnSignUp = $("#btnSignUp"),
          username = $("#username"),
          password = $("#password"),
          confirmPassword = $("#confirmPassword"),
          errSignUp = $('#errorSignUp'),
          btnLinkLogin = $("#btnLinkLogin")
    // Button Link Login Clicked, and will going to root or login page
    btnLinkLogin.click(() => window.location.href = '/')
    // Button Sign Up
    btnSignUp.click(async () => {
        try {
            // If password length is low than 8 character, throw an error
            if( password.val().length < 8 ) throw new Error("* Password setidaknya harus memiliki 8 karakter atau lebih!")
            // If password and confirmPassword is doesn't match, throw an error
            if( password.val() !== confirmPassword.val()) throw new Error("* Password tidak cocok dengan Confirm Password!")
            // Data User
            data = {
                username: username.val().trim(),
                password: password.val().trim(),
                confirmPassword: confirmPassword.val().trim()
            }
            // Get Response from sign-up endpoint
            const resp = await requestAjax({
                url: '/sign-up',
                type: "POST",
                contentType: 'application/json',
                processData: false,
                data: JSON.stringify(data)
            })
            // Get Status and Message
            const { status, message } = resp
            // Set text success of sign up to Button Sign Up
            btnSignUp.text(`✔️ ${message}. Wait for Redirecting!`)            
        }catch(err) {
            // If error is finded, set error to error element
            setErrorLoginMessage(errSignUp, err.message)
        }
    })
})