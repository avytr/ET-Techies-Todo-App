import { useEffect, useState } from 'react';  
import './Todo.css';  
import axios from 'axios';  

function Todo() {  
    const [task, setTask] = useState('');  
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {  
        try {  
            const response = await axios.get('http://localhost:5000/read-tasks');  
            setTasks(response.data);  
        } catch (error) {  
            console.error('Error fetching tasks:', error);  
        }  
    };  

    useEffect(() => {   
        fetchTasks();  
    }, []);  

    useEffect(() => {

    }, [tasks]);

    const handleAddTab = async (e) => {  
        e.preventDefault();  
        if (!task) return;  

        try {  
            const response = await axios.post('http://localhost:5000/new-task', { title: task, completed: false });  
            setTasks(prevTasks => [...prevTasks, { title: task, completed: false }]); // Update local state  
            setTask(''); // Clear input 
            fetchTasks();
        } catch (error) {  
            console.error('Error adding task:', error);  
        }  
    };  

    const handleEditTask = (id) => {
        const taskEle = document.getElementById(id);
        const taskDetailEle = taskEle.querySelector('.detail');
        
        // Tạo thẻ input
        const input = document.createElement('input');
        input.classList.add('edit-element-input');
        input.type = 'text';
        input.value = taskDetailEle.textContent;
    
        // Hàm để thay thế input với nội dung mặc định
        function replaceInputWithTaskDetail() {
            taskDetailEle.textContent = input.value; // Cập nhật nội dung
            taskDetailEle.style.display = ''; // Hiển thị lại thẻ p
            input.parentNode.replaceChild(taskDetailEle, input); // Thay thế input bằng thẻ detail
        }
    
        // Thay thế thẻ p bằng thẻ input
        taskEle.replaceChild(input, taskDetailEle);
    
        // Thêm sự kiện click để kiểm tra bên ngoài input
        const handleClickOutside = async (event) => {
            // Kiểm tra xem click có phải bên ngoài thẻ input không
            if (!taskEle.contains(event.target)) {
                replaceInputWithTaskDetail(); // Trở về thẻ p nếu click bên ngoài
                document.removeEventListener('click', handleClickOutside); // Xóa sự kiện click sau khi xử lý

                const title = taskDetailEle.textContent

                try {          
                    await axios.post(`http://localhost:5000/edit-task`, { id: id, title: title });  
                    setTasks(prevTasks => prevTasks.map((t, index) => index === id ? { ...t, title: title } : t)); // Update local state  
                } catch (error) {  
                    console.error('Error updating task completion:', error);  
                }  
            }
        };
    
        document.addEventListener('click', handleClickOutside);
        input.addEventListener('click', (event) => {
            event.stopPropagation(); // Ngăn chặn sự kiện click lan ra bên ngoài
        });
    };
    
    const handleCompletedTask = async (taskId) => {
        const taskEle = document.getElementById(taskId);  
        const taskDetailEle = taskEle.querySelector('.detail');  
        const isCompleted = taskDetailEle.classList.toggle('done') ? 1 : 0;  
  
        try {  
            await axios.post(`http://localhost:5000/update-task`, { id: taskId, completed: isCompleted });  
            setTasks(prevTasks => prevTasks.map((t, index) => index === taskId ? { ...t, completed: isCompleted } : t));
            
        } catch (error) {  
            console.error('Error updating task completion:', error);  
        }  

    };  

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await axios.post(`http://localhost:5000/delete-task`, { taskId });
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            fetchTasks();  

        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };
    
    return (
        <div className="todo-container">
            <div className="action">  
                    <input type="text" value={task} onChange={e => setTask(e.target.value)} placeholder="Write your task" />  
                    <button onClick={handleAddTab}>+</button>  
                </div>  

                <div className="todoList">  
                    {tasks != null ? tasks.map((task) => (  
                        <div key={task.Id} id={task.Id} className="task">  
                            <p className={`detail ${task.Completed ? 'done' : ''}`}>{task.Title}</p>  
                            <div className='update'>  
                                <p  
                                    className='edit'
                                    onClick={() =>  handleEditTask(task.Id)}   
                                >  
                                    Edit  
                                </p>  
                                <p  
                                    className='delete'  
                                    onClick={() => handleDeleteTask(task.Id)}  
                                >  
                                    Delete  
                                </p>  
                                <p  
                                    className='completed'  
                                    onClick={() => handleCompletedTask(task.Id)}  
                                >  
                                    Completed  
                                </p>  
                            </div>  
                        </div>  
                    )) : <p></p>}  
                </div>          
        </div>
    );
}

export default Todo;