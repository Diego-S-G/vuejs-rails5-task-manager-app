import Vue from "vue";

const Api = require('./api');

document.addEventListener("DOMContentLoaded", () => { // acredito que isso é pra rodar dps das dependencias dos packs, vue, etc
    var app = new Vue({
        el: '#app',
        components: {
            'task': {
                props: ['task'],
                template: `<div class="ui segment task" v-bind:class="task.completed ? 'done' : 'todo'">
                                <div class="ui grid">
                                    <div class="left floated twelve wide column">
                                        <div class="ui checkbox">
                                            <input type="checkbox" name="task" v-on:click="$parent.toggleDone($event, task.id)" :checked="task.completed">
                                            <label>{{ task.name }} <span class="description">{{ task.description }}</span></label>
                                        </div>
                                    </div>
                                    <div class="right floated three wide column">
                                        <i class="icon pencil blue" alt="Edit" v-on:click="$parent.editTask($event, task.id)"></i>
                                        <i class="icon trash red" alt="Delete" v-on:click="$parent.deleteTask($event, task.id)"></i>
                                    </div>
                                </div>
                            </div>`
            } // app.toggleDone(...) pq sem não funciona, por causa do escopo. Agr mudou para $parent.toggleDone(...) pq é uma aplicação maior que a antiga
        },
        data: {
            tasks: [],
            task: {},
            message: '',
            action: 'create'
        },
        computed: { // esses computed são funções mas são que tratadas como propriedades
            completedTasks: function() {
                return this.tasks.filter(item => item.completed === true);
            },
            todoTasks: function() {
                return this.tasks.filter(item => item.completed === false);
            },
            nextId: function() {
                return (this.tasks.sort(function(a,b){ return a.id - b.id }))[this.tasks.length - 1].id + 1;
            }
        },
        methods: {
            listTasks: function() {
                Api.listTasks().then(function(response) {
                    return app.tasks = response;
                })
            },
            clear: function() {
                this.task = {};
                this.action = 'create';
                this.message = '';
            },
            toggleDone: function(event, id) {
                event.stopImmediatePropagation();
    
                let task = this.tasks.find(item => item.id == id);
                
                if (task) {
                    task.completed = !task.completed;
                    this.message = `Task ${task.name} is now ${task.completed ? 'done' : 'todo'}`;
                }
            },
            createTask: function(event) {
    
                if (!this.task.completed) {
                    this.task.completed = false;
                } else {
                    this.task.completed = true;
                }
    
                Api.createTask(this.task).then(function(response){
                    app.listTasks();
                    app.clear();
                    app.message = `Task with Id ${response.id} was created`;
                });
            },
            editTask: function(event, id) {
                this.action = 'edit';
                let task = this.tasks.find(item => item.id == id);
    
                if (task) {
                    this.task = { id: id, name: task.name, description: task.description, completed: task.completed };
                }
            },
            updateTask: function(event, id) {
                event.stopImmediatePropagation();
    
                Api.updateTask(this.task).then(function(response){
                    app.listTasks();
                    app.clear();
                    app.message = `Task ${response.id} was updated`;
                });
            },
            deleteTask: function(event, id) {
                event.stopImmediatePropagation(); // clicking it does not trigger any other event handlers at the same time
    
                let taskIndex = this.tasks.findIndex(item => item.id == id);
    
                if (taskIndex > -1) {
                    Api.deleteTask(id).then(function(response){
                        app.$delete(app.tasks, taskIndex); // vue method to delete an item from a collection
                        app.message = `Task with id ${id} was deleted`;
                    });
                }
            }
        },
        beforeMount() { this.listTasks() }
    });
});