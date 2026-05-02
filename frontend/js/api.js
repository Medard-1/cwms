function registerChild() {
    const data = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        guardian: document.getElementById("guardian").value
    };

    fetch("http://localhost:3000/api/children", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("message").innerText = "Child Registered!";
    })
    .catch(err => console.error(err));
}