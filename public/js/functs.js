// Function Request AJAX
function requestAjax(config) {
    // Get property object from config
    const { url, type, contentType, processData, data } = config
    // Return Promise with Resolved or Rejected
    return new Promise((resolve, reject) => {
        // AJAX
        $.ajax({
            url: url,
            type: type,
            contentType: contentType,
            processData: processData,
            data: data,
            success: function(resp) {
                resolve(resp)
            },
            error: function(err) {
                reject(err)
            }
        })
    })
}

// Function to set waiting for login
function setWaitingForLogin(counterLogin, buttonLogin) {
    // If Counter Login increse to 3
    if( counterLogin === 3 ) {
        // Disable Button Login with prop
        buttonLogin.prop('disabled', true)
        // Set Timeout
        setTimeout(() => {
            // Enable Button Login with prop
            buttonLogin.prop('disabled', false)
            // Set default text in Button Login
            buttonLogin.text('Login')
        }, 30000)
        // Print message wait to console
        console.log('Terlalu banyak upaya login! Silahkan tunggu beberapa detik...')
        // Then Return false/null value
        return
    }
}

// Function Set Error Login Message
function setErrorLoginMessage(errorElement, text) {
    // Set text to element error
    errorElement.text(text)
}