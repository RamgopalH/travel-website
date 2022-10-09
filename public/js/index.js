var ans;

function generateCapthca() {
    let num1 = Math.floor(Math.random() * 100);
    let num2 = Math.floor(Math.random() * 100);
    
    let Captcha;
    if (Math.random() > 0.5) {
        ans = num1 - num2;
        Captcha = num1 + "-" + num2;
    } else {
        ans = num1 + num2;
        Captcha = num1 + "+" + num2;
    }
    console.log(Captcha, ans);

    document.querySelector("#captcha-box").innerHTML = Captcha;

}

generateCapthca();

document.querySelector("#reload").addEventListener("click", generateCapthca);

document.querySelector("#validateBtn").addEventListener("click", validate);

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") validate();
});

function validate() {
    if (ans == document.querySelector("#captcha").value) {
        console.log("Valid Captcha");
        document.querySelector("#loginForm").submit();
    } else {
        document.querySelector("#captcha").classList.add('red');
    }
}