document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value.trim();

    if (name === "" || age === "") {
        alert("All fields are required!");
        return;
    }

    if (age < 0) {
        alert("Age cannot be negative!");
        return;
    }

    registerChild(); // call API
});