import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,push,onValue,remove,set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const appSetting={
    databaseURL:'https://todolist-1234-96e2d-default-rtdb.firebaseio.com/',
}

const app=initializeApp(appSetting);
const database=getDatabase(app);
const tasksListInDB=ref(database,"tasks");


// form page
if (document.querySelector('.task-form')) {
    const idEl=document.querySelector('#id');
    const frm = document.querySelector('.task-form');
    const titleEl = document.querySelector('#title');
    const descEl = document.querySelector('#description');

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("idEl");
    const editTitle = params.get("titleEl");
    const editDesc = params.get("descEl");
    console.log(editId);

    // If edit mode, set values
    if (editId) {
        idEl.value= editId;
        titleEl.value = editTitle;
        descEl.value = editDesc;
        console.log(titleEl.value,descEl.value);
    }

    frm.addEventListener("submit", function(e) {
        e.preventDefault();
        let now = new Date();
        let crnttime = now.toLocaleTimeString();
        //console.log(idEl.value);

        if (!titleEl.value.trim() || !descEl.value.trim()) {
            alert("Please Fill all details!");
            return;
        }
        

        else if (idEl.value){

            set(ref(database,`tasks/${idEl.value}`),{
                name: titleEl.value.trim(),
                desc: descEl.value.trim(),
                time: crnttime,
            }).then(()=>{
                alert("Task Edited Sucessfully!");
                window.location.href='list.html';
            })
        }
        else{
            const newTask = {
                name: titleEl.value.trim(),
                desc: descEl.value.trim(),
                time: crnttime,
            };
            push(tasksListInDB, newTask).then(()=>{
                alert("New Task Added sucessfully!");
                titleEl.value = "";
                descEl.value = "";
            });
        }
    });
}

// list page
if (document.querySelector('#taskTableBody')) {
    const tblEl = document.querySelector('#taskTableBody');
    

    document.addEventListener('click',function(e){
        e.preventDefault();
        if (e.target.classList.contains('btn-edit')){
            const id=e.target.dataset.id;
            let data=ref(database,`tasks/${id}`);
            onValue(data,(snapshot)=>{
                const Data=snapshot.val();
                // console.log(Data);
                window.location.href=`addtask.html?idEl=${id}&titleEl=${encodeURIComponent(Data.name)}&descEl=${encodeURIComponent(Data.desc)}`;
            },{onlyOnce:true});
            // console.log('Edit',id);
                
                
        }else if(e.target.classList.contains('btn-delete')){
            e.stopPropagation();
            e.preventDefault();
            const id =e.target.dataset.id;

            // console.log('Edit',id);
            if (confirm("Are you sure to Delete?")){
                console.log(id);
                let data=ref(database,`tasks/${id}`);
                console.log(id,data);
                remove(ref(database,`tasks/${id}`)).then(() => {
                    alert("Task deleted successfully!");
                })
                .catch((error) => {
                    console.error("Error deleting task:", error);
                    alert("Failed to delete task.");
                });
            }
        };
    });

    onValue(tasksListInDB, function(snapshot) {
        if (snapshot.exists()) {
            let taskArray=Object.entries(snapshot.val());
            // console.log(taskArray);
            tblEl.innerHTML="";
            for(let i=0;i<taskArray.length;i++){
                let currentTask=taskArray[i];
                // console.log(currentTask);
                let currentTaskId=currentTask[0];
                let currentTaskValue=currentTask[1];
 

                tblEl.innerHTML +=`
                <tr>
                    <td>${i+1}</td>
                    <td>${currentTaskValue.name}</td>
                    <td>${currentTaskValue.desc}</td>
                    <td>${currentTaskValue.time}</td>
                    <td>
                        <button class="btn-edit" data-id="${currentTaskId}" href="addtask.html">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                    </td>
                    <td>
                        <button class="btn-delete" data-id="${currentTaskId}" >
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </td>
                </tr>
                `;
            }
        } else {
            tblEl.innerHTML = "<tr><td colspan='5'>No Record Found</td></tr>";
        }
    });
    
}

