var express = require('express')
var app = express()
 
// SHOW LIST OF USERS
app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM todos ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('task/list', {
                    title: 'Task List', 
                    data: ''
                })
            } else {
                // render to views/user/list.ejs template file
                res.render('task/list', {
                    title: 'Task List', 
                    data: rows
                })
            }
        })
    })
})
 
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){    
    // render to views/user/add.ejs
    res.render('task/add', {
        title: 'Add New Task',
        task_name: '',    
    })
})
 
// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){    
    req.assert('task_name', 'Name is required').notEmpty() 
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        
        var task = {
            task_name: req.sanitize('task_name').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO todos SET ?', task, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('task/add', {
                        title: 'Add New Task',
                        task_name: task.task_name,               
                    })
                } else {                
                    req.flash('success', 'Data added successfully!')
                    
                    // render to views/user/add.ejs
                    res.render('task/add', {
                        title: 'Add New User',
                        task_name: '',                  
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        req.flash('error', error_msg)        
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('user/add', { 
            title: 'Add New User',
            task_name: req.body.task_name,
        })
    }
})
 
// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM todos WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'User not found with id = ' + req.params.id)
                res.redirect('/tasks')
            }
            else { // if user found
                // render to views/user/edit.ejs template file
                res.render('task/edit', {
                    title: 'Edit Task', 
                    //data: rows[0],
                    id: rows[0].id,
                    task_name: rows[0].task_name,                   
                })
            }            
        })
    })
})
 
// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
    req.assert('task_name', 'Name is required').notEmpty()           //Validate name
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var task = {
            task_name: req.sanitize('task_name').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE todos SET ? WHERE id = ' + req.params.id, task, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('task/edit', {
                        title: 'Edit Task',
                        id: req.params.id,
                        task_name: req.body.task_name
                    })
                } else {
                    req.flash('success', 'Data updated successfully!')
                    
                    // render to views/user/add.ejs
                    res.render('task/edit', {
                        title: 'Edit Task',
                        id: req.params.id,
                        task_name: req.body.task_name
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('task/edit', { 
            title: 'Edit Task',            
            id: req.params.id,
			name: req.body.task_name
        })
    }
})
 
// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
    var user = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM todos WHERE id = ' + req.params.id, user, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                // redirect to users list page
                res.redirect('/tasks')
            } else {
                req.flash('success', 'User deleted successfully! id = ' + req.params.id)
                // redirect to users list page
                res.redirect('/tasks')
            }
        })
    })
})
 
module.exports = app