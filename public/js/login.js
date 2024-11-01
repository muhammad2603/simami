$(() => {
    // Variable Button Login
    const btnLogin = $('#btnLogin'),
          errorLogin = $("#errorLogin"),
          checkToken = localStorage.getItem('token')
    // Counter Login
    let waitingForNextLogin = 0
    // Button Link Sign Up Clicked
    $("#btnLinkSignUp").click(() => window.location.href = '/sign-up')
    // Button Login Clicked
    btnLogin.click(async function() {
        // Set Waiting For Login
        setWaitingForLogin(waitingForNextLogin, btnLogin)
        // Data Username and Password User
        const data = {
            username: $('#username').val().trim(),
            password: $('#password').val().trim()
        }
        // Try & Catch
        try {
            // Response from Server
            const resp = await requestAjax({
                url: "/login",
                type: "POST",
                contentType: "application/json",
                processData: false,
                data: JSON.stringify(data)
            })
            // If Error Login Message Exist, setErrorLoginMessage
            if( errorLogin.text() ) setErrorLoginMessage(errorLogin, '')
            // Message from Response (Object)
            const { message, token } = resp
            // If token doesn't exist in Local Storage
            if( !checkToken ) {
                // Get token from response server, and create token on Local Storage
                localStorage.setItem('token', token)
            }

            $.ajax({
                url: '/dashboard',
                type: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                success: function() {
                    window.location.href = '/dashboard'
                }
            })

            // Set Text on Button Login
            btnLogin.text(`✔️ ${message}`)
        }catch(err) {
            // If error
            // Increase Counter Login with up +1
            waitingForNextLogin += 1
            // Get Status on Response Text
            const { status, message } = JSON.parse(err.responseText)
            // If Status is 404, then return with show message error to element errorLogin
            if( status === 404 ) setErrorLoginMessage(errorLogin, '* Pengguna tidak ditemukan.')
            // If Status is 400, then return with show message error to element errorLogin
            if( status === 400 ) setErrorLoginMessage(errorLogin, `* ${message}`)
            // Set Text on Button Login
            btnLogin.text(`❌ Login Gagal!`)
            // Set Text on Button Login to default 1 second next
            setTimeout(() => btnLogin.text('Login'), 1000)
        }

    })

})