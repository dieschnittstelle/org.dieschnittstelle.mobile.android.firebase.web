class ViewController {

    constructor() {
        this.userTemplate = null;
        this.user = {};
        var lastUseremail = localStorage.getItem("lastUseremail");
        if (lastUseremail) {
            this.user.email = lastUseremail;
        }
        this.event = null;
        this.status = "loggedout"

        this.todolistTemplate = null;
        this.todos = [];
        this.newtodo = {};

        this.crudops = new TodoCRUDOperations();
    }

    oncreate() {
        console.log("oncreate()");

        // bind the login view
        var userView = document.getElementById("userView");
        var userTemplateStr = userView.outerHTML;
        var userParent = userView.parentNode;
        userParent.removeChild(userView);

        // instantiate the form
        this.userTemplate = new Ractive({
            el: userParent,
            template: userTemplateStr,
            data: this
        });

        // bind the list view
        var todolistView = document.getElementById("todolistView");
        var todolistTemplateStr = todolistView.outerHTML;
        var todolistParent = todolistView.parentNode;
        todolistParent.removeChild(todolistView);
        this.todolistTemplate = new Ractive({
            el: todolistParent,
            template: todolistTemplateStr,
            data: this
        });

        // we bind the actions from the templates
        this.userTemplate.on("submitRegisterForm", (evt) => this.submitRegisterForm(evt));
        this.userTemplate.on("submitLoginForm", (evt) => this.submitLoginForm(evt));
        this.userTemplate.on("logoutUser", (evt) => this.logout());

        this.todolistTemplate.on("submitTodoForm", (evt) => this.submitTodoForm(evt));
        this.todolistTemplate.on("deleteTodo", (evt) => this.deleteTodo(evt));

    }

    /* login and registration */

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
                    localStorage.setItem("lastUseremail", this.user.email);
                    this.showTodolist();
                }, 2000);
            }).catch(function (error) {
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
            localStorage.setItem("lastUseremail", this.user.email);
            this.userTemplate.set(this);
            this.showTodolist();
        }).catch(function (error) {
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
            document.getElementById("todolistView").hidden = true;
        }).catch(function (error) {
            alert("ERROR " + error.code + " on logout(): " + error.message)
        });
    }

    /* todo list */

    showTodolist() {
        console.log("showTodolist()");
        document.getElementById("todolistView").hidden = false;
        this.crudops.initialise();
        this.crudops.readAll().then(alltodos => {
            console.log("showTodolist(): todos are: ", alltodos);
            this.todos = alltodos;
            this.todolistTemplate.set(this);
        });
    }

    submitTodoForm(evt) {
        console.log("submitTodoForm(): ", this.newtodo);
        evt.original.preventDefault();
        this.createTodo(this.newtodo);
    }

    createTodo(todo) {
        console.log("createTodo()");
        this.crudops.create(todo).then(created => {
            console.log("created: ", created);
            this.todos.push(created);
            this.newtodo = {};
            this.todolistTemplate.set(this);
        });
    }

    deleteTodo(evt) {
        console.log("deleteTodo()");
        var todoid = evt.original.target.parentNode.parentNode.getAttribute("data-todo-id");
        console.log("will delete todo with id: " + todoid);
        this.crudops.delete(todoid).then(() => {
                this.todos = this.todos.filter(todo => todo.id != todoid);
                this.todolistTemplate.set(this);
            }
        );
    }

}

window.onload = () => {
    var vc = new ViewController();
    vc.oncreate();
};