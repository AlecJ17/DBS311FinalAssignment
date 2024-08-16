const API_URL = 'http://localhost:8080/students';

// Function to display a message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    document.body.insertBefore(messageDiv, document.body.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Fetch and display students by status
function fetchStudents() {
    fetch(API_URL)
        .then(response => response.json())
        .then(students => {
            const activeTbody = document.querySelector('#activeStudentsTable tbody');
            const graduatedTbody = document.querySelector('#graduatedStudentsTable tbody');
            const droppedTbody = document.querySelector('#droppedStudentsTable tbody');

            activeTbody.innerHTML = ''; // Clear the active table
            graduatedTbody.innerHTML = ''; // Clear the graduated table
            droppedTbody.innerHTML = ''; // Clear the dropped table

            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.age}</td>
                    <td>${student.status}</td>
                    <td class="actions">
                        ${student.status === 'active' ? `
                            <button onclick="updateStatus('${student._id}', 'graduated')">Graduate</button>
                            <button onclick="updateStatus('${student._id}', 'dropped')">Drop</button>
                        ` : ''}
                        ${student.status === 'graduated' ? `
                            <button onclick="updateStatus('${student._id}', 'active')">Reactivate</button>
                            <button onclick="updateStatus('${student._id}', 'dropped')">Drop</button>
                        ` : ''}
                        ${student.status === 'dropped' ? `
                            <button onclick="updateStatus('${student._id}', 'active')">Reactivate</button>
                            <button onclick="updateStatus('${student._id}', 'graduated')">Graduate</button>
                        ` : ''}
                        <button onclick="deleteStudent('${student._id}')">Delete</button>
                    </td>
                `;

                // Append student to the correct table based on their status
                if (student.status === 'active') {
                    activeTbody.appendChild(tr);
                } else if (student.status === 'graduated') {
                    graduatedTbody.appendChild(tr);
                } else if (student.status === 'dropped') {
                    droppedTbody.appendChild(tr);
                }
            });
        })
        .catch(error => console.error('Error fetching students:', error));
}

// Add a new student
document.getElementById('addStudentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;
    const status = document.getElementById('status').value;

    if (!name || !email || !age || !status) {
        showMessage('All fields are required', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Invalid email format', 'error');
        return;
    }

    if (!isValidAge(age)) {
        showMessage('Age must be between 18 and 30', 'error');
        return;
    }

    const newStudent = { name, email, age, status };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStudent)
    })
        .then(response => response.json())
        .then(() => {
            fetchStudents(); // Refresh the student list
            showMessage('Student added successfully', 'success');
            document.getElementById('addStudentForm').reset(); // Clear the form
        })
        .catch(error => {
            console.error('Error adding student:', error);
            showMessage('Error adding student', 'error');
        });
});

// Update a student's status
function updateStatus(studentId, status) {
    fetch(`${API_URL}/${studentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
        .then(response => response.json())
        .then(() => {
            fetchStudents(); // Refresh the student list
            showMessage(`Student status updated to ${status}`, 'success');
        })
        .catch(error => {
            console.error('Error updating status:', error);
            showMessage('Error updating status', 'error');
        });
}

// Delete a student
function deleteStudent(studentId) {
    fetch(`${API_URL}/${studentId}`, {
        method: 'DELETE'
    })
        .then(() => {
            fetchStudents(); // Refresh the student list
            showMessage('Student deleted', 'success');
        })
        .catch(error => {
            console.error('Error deleting student:', error);
            showMessage('Error deleting student', 'error');
        });
}

// Validate email format
function isValidEmail(email) {
    const emailPattern = /^.+@.+\..+$/;
    return emailPattern.test(email);
}

// Validate age
function isValidAge(age) {
    return age >= 18 && age <= 30;
}

// Fetch and display top 10 students (BONUS TASK)

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementsByClassName('tablinks')[0].click();

function fetchTopStudents() {
    fetch('http://localhost:8080/top-students')
        .then(response => response.json())
        .then(students => {
            const tbody = document.querySelector('#topStudentsTable tbody');
            tbody.innerHTML = ''; // Clear the table first

            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.averageGrade.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching top students:', error));
}

// Fetch students when the page loads
window.onload = () => {
    fetchStudents();
    fetchTopStudents();
};