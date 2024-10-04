const express = require('express');  
const bodyParser = require('body-parser');  
const { Connection, Request, TYPES } = require('tedious');  
const cors = require('cors');  

const app = express();  
const port = 5000;  

app.use(cors());  
app.use(bodyParser.json());  

const config = {  
    server: 'MSI\\MSSQLSERVER2022',  
    authentication: {  
        type: 'default',  
        options: {  
            userName: 'avy',  
            password: '12345678'  
        }  
    },  
    options: {  
        encrypt: false,  
        trustServerCertificate: true,  
        database: 'TodoListDB'  
    }  
};  

// Create a new connection  
const connection = new Connection(config);  

// Handle connection events  
connection.on('connect', err => {  
    if (err) {  
        console.error("Database connection failed: ", err);  
    } else {  
        console.log("Connected to the database");  
    }  
});  

// Connect to the database  
connection.connect(err => {  
    if (err) {  
        console.error('Connection failed: ', err);  
    }  
});  

// Utility function for executing a query  
function executeQuery(query, parameters = []) {  
    return new Promise((resolve, reject) => {  
        const request = new Request(query, (err) => {  
            if (err) {  
                console.error("SQL Request Error: ", err);  
                reject(err);  
            }  
        });  

        const result = [];   

        request.on('row', columns => {  
            const entry = columns.reduce((acc, column) => {  
                acc[column.metadata.colName] = column.value;  
                return acc;  
            }, {});  
            
            result.push(entry);  
            
        });  

        request.on('doneProc', () => {  
            resolve(result); 
        });  

        request.on('error', err => {  
            console.error("Error during SQL execution: ", err);  
            reject(err);  
        });  

        connection.execSql(request);  
    });  
}  

// Route to add a new task  
app.post('/new-task', (req, res) => {  
    const { title, completed } = req.body;  

    const insertQuery = `INSERT INTO Todos (Title, Completed) VALUES (@title, @completed);`;  
    const request = new Request(insertQuery, err => {  
        if (err) {  
            console.error("Lỗi SQL: ", err);  
            return res.status(500).send('Lỗi khi thực thi câu lệnh SQL: ' + err.message);  
        }  
        res.status(200).send('Nhiệm vụ đã được thêm thành công');  
    });  

    request.addParameter('title', TYPES.NVarChar, title);  
    request.addParameter('completed', TYPES.Bit, completed);  

    connection.execSql(request);  // Sử dụng kết nối đã chia sẻ  
});    

// Route to read tasks  
app.get('/read-tasks', (req, res) => {  
    const readQuery = `SELECT * FROM Todos ORDER BY Id DESC;`;  

    executeQuery(readQuery)  
        .then(tasks => {
            return res.json(tasks);
        })  
        .catch(err => res.send('Error executing SQL query: ' + err.message));  
});

// Route to delete the task  
app.post('/delete-task', (req, res) => {
    const { taskId } = req.body; // Lấy taskId từ body của yêu cầu

    if (!taskId) {
        return res.status(400).send('Task ID không được cung cấp.');
    }

    const deleteQuery = `DELETE FROM Todos WHERE Id = @taskId`;
    const request = new Request(deleteQuery, err => {  
        if (err) {  
            console.error("Lỗi SQL: ", err);  
            return res.status(500).send('Lỗi khi thực thi câu lệnh SQL: ' + err.message);  
        }
        res.status(200).send('Nhiệm vụ đã được xóa thành công');  
    });  

    request.addParameter('taskId', TYPES.Int, taskId); // Thêm tham số cho truy vấn

    connection.execSql(request); // Thực thi truy vấn
});

// Route to edit the task  
app.post('/edit-task', (req, res) => {
    const { id, title } = req.body; // Lấy id, title từ body của yêu cầu

    if (!id) {
        return res.status(400).send('Task ID không được cung cấp.');
    }

    const editQuery = `UPDATE Todos SET Title = @title WHERE Id = @id`;
    const request = new Request(editQuery, err => {  
        if (err) {  
            console.error("Lỗi SQL: ", err);  
            return res.status(500).send('Lỗi khi thực thi câu lệnh SQL: ' + err.message);  
        }
        res.status(200).send('Nhiệm vụ đã được xóa thành công');  
    });  

    request.addParameter('Id', TYPES.Int, id); // Thêm tham số cho truy vấn
    request.addParameter('Title', TYPES.NVarChar, title); // Thêm tham số cho truy vấn

    connection.execSql(request); // Thực thi truy vấn
});

// Route to complete the task  
app.post('/update-task', (req, res) => {
    const { id, completed } = req.body; // Lấy id, completed từ body của yêu cầu

    if (!id) {
        return res.status(400).send('Task ID không được cung cấp.');
    }

    const updateQuery = `UPDATE Todos SET Completed = @completed WHERE Id = @id`;
    const request = new Request(updateQuery, err => {  
        if (err) {  
            console.error("Lỗi SQL: ", err);  
            return res.status(500).send('Lỗi khi thực thi câu lệnh SQL: ' + err.message);  
        }
        res.status(200).send('Nhiệm vụ đã được xóa thành công');  
    });  

    request.addParameter('Id', TYPES.Int, id); // Thêm tham số cho truy vấn
    request.addParameter('Completed', TYPES.Bit, completed); // Thêm tham số cho truy vấn

    connection.execSql(request); // Thực thi truy vấn
});


// Start the server  
app.listen(port, () => {  
    console.log(`Server is running at http://localhost:${port}`);  
});