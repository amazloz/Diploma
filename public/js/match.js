let currentNoteId = null;

const nlanguage = document.getElementById("nlanguage");
const llanguage = document.getElementById("llanguage");
const interest = document.getElementById("interest");
const results_body = document.querySelector("#results");
const note_title = document.getElementById("note-title");
const note_textarea = document.getElementById("note-textarea");
const user_id = localStorage.getItem("user_id");

load_data();

const userInfo = async (e) => {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("No user logged in");
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch(`/api/profile?username=${username}`, {
      method: "GET",
    });

    if (res.ok) {
      const data = await res.json();
      nlanguage.textContent = `Native language: ${data.user_nlanguage}`;
      llanguage.textContent = `Learning language: ${data.user_llanguage}`;
      interest.textContent = `Interest: ${data.user_interest}`;
    } else {
      alert("Failed to fetch user info");
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    alert("An error occurred. Please try again.");
    window.location.href = "/login";
  }
};

window.onload = async function () {
  await userInfo();
  afterStrangerCall();
};

function afterStrangerCall() {
  const StrangerCall = localStorage.getItem("StrangerCall");
  const respectful = localStorage.getItem("respectful");
  const overAge = localStorage.getItem("overAge");
  const friend = localStorage.getItem("friend");
  if (StrangerCall === "aftercall") {
    console.log(StrangerCall);
    toggleFriendPopup();
    toggleReviewPopup();
  }
  if (respectful === "1") {
  }
  if (overAge === "1") {
  }
  if (friend === "1") {
  }
}

function load_data() {
  const request = new XMLHttpRequest();
  request.open(`get`, `/api/notes?created_by=${user_id}`);

  let html = ``;

  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      const results = JSON.parse(request.responseText);

      results.forEach((result) => {
        const noteContent = result.note_content.replace(/<br>/g, "\n");
        html +=
          `
          <div class="single-note" onclick="editNote('${result.note_id}', '${result.note_title}', '${result.note_content}')">
            <h2>` +
          result.note_title +
          `</h2>
          </div>
        `;
      });
      results_body.innerHTML = html;
    } else {
    }
  };
  request.send();
}

document
  .getElementById("createnote-button")
  .addEventListener("click", function () {
    currentNoteId = null;
    clearValue();
    toggleNotePopup();
  });

window.editNote = function (note_id, note_title_value, note_content_value) {
  currentNoteId = note_id;
  note_title.value = note_title_value;
  note_textarea.value = note_content_value.replace(/<br>/g, "\n");
  toggleNotePopup();
};

function checkInput() {
  const titleValue = note_title.value;
  const contentValue = note_textarea.value;
  let message = "";

  if (titleValue.length < 1) {
    message = "Title is empty";
  } else if (contentValue.length < 1) {
    message = "Note is empty";
  }
  return message;
}

document
  .getElementById("savenote-button")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    event.stopPropagation();
    const username = localStorage.getItem("username");
    if (!username) {
      alert("No user logged in");
      window.location.href = "/login";
      return;
    }

    const inputCheckMessage = checkInput();
    if (inputCheckMessage) {
      alert(inputCheckMessage);
      return;
    }

    const infos = {
      note_title: note_title.value,
      note_content: note_textarea.value.replace(/\n/g, "<br>"),
      created_by: user_id,
    };

    const url = currentNoteId ? `/api/notes/${currentNoteId}` : "/api/notes";
    const method = currentNoteId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infos),
      });

      const text = await response.text();

      const result = JSON.parse(text);

      if (response.status === 201 || response.status === 200) {
        alert(result.message);
        toggleNotePopup();
        clearValue();
        load_data();
        currentNoteId = null;
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error during note saving process:", error);
      alert("An error occurred. Please try again.");
    }
  });
document
  .getElementById("deletenote-button")
  .addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (!currentNoteId) return;

    const url = `/api/notes/${currentNoteId}`;

    fetch(url, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message === "Note deleted successfully") {
          toggleNotePopup();
          clearValue();
          currentNoteId = null;
          load_data();
        } else {
          console.log(result.message);
        }
      })
      .catch((error) => {
        console.error("Error during note deletion process:", error);
        alert("An error occurred. Please try again.");
      });
  });

function clearValue() {
  note_title.value = "";
  note_textarea.value = "";
}

function toggleReviewPopup() {
  document.getElementById("popup-1").classList.toggle("active");
}
function toggleFriendPopup() {
  document.getElementById("popup-2").classList.toggle("active");
}
function toggleNotesPopup() {
  document.getElementById("popup-allnote").classList.toggle("active");
}
function toggleNotePopup() {
  document.getElementById("popup-singlenote").classList.toggle("active");
}

document
  .getElementById("yesfriendbutton")
  .addEventListener("click", function (event) {
    localStorage.setItem("friend", "yes");
  });
document
  .getElementById("yesrespectfulbutton")
  .addEventListener("click", async function (event) {
    localStorage.setItem("respectful", "yes");

    const username = localStorage.getItem("username");
    if (!username) {
      alert("No user logged in");
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/profile?username=${username}`, {
        method: "GET",
      });

      if (res.ok) {
        const increment = 0.1;
        const decrement = 0;

        const updateRes = await fetch("/api/user/rating", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, increment, decrement }),
        });

        if (updateRes.ok) {
          const updateData = await updateRes.json();
        } else {
          console.log("Failed to update rating");
        }
      } else {
        alert("Failed to fetch user info");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error updating user rating:", error);
      alert("An error occurred. Please try again.");
      window.location.href = "/login";
    }
  });

document
  .getElementById("norespectfulbutton")
  .addEventListener("click", async function (event) {
    localStorage.setItem("respectful", "no");

    const username = localStorage.getItem("username");
    if (!username) {
      alert("No user logged in");
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/profile?username=${username}`, {
        method: "GET",
      });

      if (res.ok) {
        const increment = 0;
        const decrement = 0.1;

        const updateRes = await fetch("/api/user/rating", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, increment, decrement }),
        });

        if (updateRes.ok) {
          const updateData = await updateRes.json();
        } else {
          console.log("Failed to update rating");
        }
      } else {
        alert("Failed to fetch user info");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error updating user rating:", error);
      alert("An error occurred. Please try again.");
      window.location.href = "/login";
    }
  });

document
  .getElementById("yesagebutton")
  .addEventListener("click", async function (event) {
    localStorage.setItem("overAge", "yes");

    const username = localStorage.getItem("username");
    if (!username) {
      alert("No user logged in");
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/profile?username=${username}`, {
        method: "GET",
      });

      if (res.ok) {
        const increment = 0.5;
        const decrement = 0;

        const updateRes = await fetch("/api/user/rating", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, increment, decrement }),
        });

        if (updateRes.ok) {
          const updateData = await updateRes.json();
          console.log("updated rating");
        }
      } else {
        alert("Failed to fetch user info");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error updating user rating:", error);
      alert("An error occurred. Please try again.");
      window.location.href = "/login";
    }
  });

document
  .getElementById("noagebutton")
  .addEventListener("click", async function (event) {
    localStorage.setItem("overAge", "no");

    const username = localStorage.getItem("username");
    if (!username) {
      alert("No user logged in");
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/profile?username=${username}`, {
        method: "GET",
      });

      if (res.ok) {
        const increment = 0;
        const decrement = 0.5;

        const updateRes = await fetch("/api/user/rating", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, increment, decrement }),
        });

        if (updateRes.ok) {
          const updateData = await updateRes.json();
        } else {
          console.log("Failed to update rating");
        }
      } else {
        alert("Failed to fetch user info");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error updating user rating:", error);
      alert("An error occurred. Please try again.");
      window.location.href = "/login";
    }
  });
