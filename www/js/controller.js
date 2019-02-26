class ViewController {

    constructor() {
        this.user = {};
        this.event = null;
        this.status = "loggedout"
        this.userTemplate = null;
    }

    oncreate() {
        console.log("oncreate()");
        var userView = document.getElementById("userView");
        var userTemplateStr = userView.outerHTML;
        var userParent = userView.parentNode;

        // instantiate the form
        this.userTemplate = new Ractive({
            el: userParent,
            template: userTemplateStr,
            data: this
        });

        // we bind the form to the submit action
        this.userTemplate.on("submitRegisterForm", (evt) => this.submitRegisterForm(evt));
        this.userTemplate.on("submitLoginForm", (evt) => this.submitLoginForm(evt));
        this.userTemplate.on("logoutUser", (evt) => this.logout());

    }

    submitRegisterForm(evt) {
        console.log("submitLoginForm()");
        evt.original.preventDefault();

        var confirmPwdField = document.forms["registerForm"].confirmPwd;
        confirmPwdField.oninput = () => confirmPwdField.setCustomValidity("");

        if (this.user.pwd != this.user.confirmPwd) {
            // document.forms["registerForm"].confirmPwd.oninvalid = () => alert("invalid!");
            confirmPwdField.setCustomValidity("Die Passwörter stimmen nicht überein!");
            confirmPwdField.reportValidity();
        }
        else {
            console.log("continue submission...");
            firebase.auth().createUserWithEmailAndPassword(this.user.email, this.user.pwd).then(() => {
                this.event = "registrationSuccess";
                this.userTemplate.set(this);
                setTimeout(() => {
                    this.event = null;
                    this.status = "loggedin";
                    this.userTemplate.set(this);
                },2000);
            }).catch(function(error) {
                confirmPwdField.setCustomValidity("ERROR " + error.code + ": " + error.message);
                confirmPwdField.reportValidity();
            });
        }
    }

    submitLoginForm(evt) {
        var pwdField = document.forms["loginForm"].pwd;
        pwdField.oninput = () => pwdField.setCustomValidity("");

        console.log("submitLoginForm()");
        evt.original.preventDefault();
        firebase.auth().signInWithEmailAndPassword(this.user.email, this.user.pwd).then(() => {
            this.status = "loggedin";
            this.userTemplate.set(this);
        }).catch(function(error) {
            pwdField.setCustomValidity("ERROR " + error.code + ": " + error.message);
            pwdField.reportValidity();
        });
    }

    logout() {
        console.log("logout()");
        firebase.auth().signOut().then(() => {
            this.status = "loggedout";
            this.register = false;
            this.userTemplate.set(this);
        }).catch(function(error) {
            alert("ERROR " + error.code + " on logout(): " + error.message)
        });
    }

}

window.onload = () => {var vc = new ViewController(); vc.oncreate();};