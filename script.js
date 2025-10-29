document.getElementById('email-placeholder').addEventListener('click', function() {
    const email = this.innerText;
    navigator.clipboard.writeText(email).then(function() {
        alert('Email copied to clipboard');
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
});


function addEmailToDOM(email) {
    document.getElementById('email-placeholder').innerText = email;
}

setTimeout(() => {
    addEmailToDOM('reneecai.7.12@gmail.com');
}, 1000); // 1000ms or 1 second delay