import axios from "axios";

export function listTasks() {
  return axios.get("/tasks.json").then(function(response){
    return response.data;
  });
}

export function createTask(task) {
    let localTask = task;
    
    delete localTask.id; // creio que isso é para garantir que o id não seja enviado ao servidor, o Rails se encarrega de criar o id

    return axios.post("/tasks.json", localTask).then(function(response){
        return response.data;
    }).catch(function(error){
        console.log(error);
    });
}