class TodoCRUDOperations {

    initialise() {
        this.todos = firebase.firestore().collection("todos");
        this.user = firebase.auth().currentUser;

        console.log("initialise(): id of current user is: " + this.user.uid);
    }

    create(todo) {
        console.log("create(): ", todo);
        todo.owner = this.user.uid;
        return new Promise((resolve, reject) => {
            this.todos.add(todo).then(doc => {todo.id = doc.id; resolve(todo)});
        });
    }

    delete(todoid) {
        console.log("delete(): ", todoid);
        return new Promise((resolve,reject) => {
            this.todos.doc(todoid).delete().then(resolve(true));
        });
    }

    readAll() {
        console.log("readAll()");
        return new Promise((resolve,reject) => {
            this.todos.where("owner", "==", this.user.uid).get().then((querySnapshot) => {
                var todos = [];
                querySnapshot.forEach((doc) => {
                    var todo = {...doc.data()};
                    todo.id = doc.id;
                    todos.push(todo);
                });
                resolve(todos);
            });
        });
    }

}

