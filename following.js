const main_URL = "https://lighthouse-user-api.herokuapp.com/";
const index_URL = main_URL + "api/v1/users";
const userPanel = document.querySelector("#user-panel");
const userInfoModal = document.querySelector("#userInfoModal");
const paginator = document.querySelector("#paginator");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const numOfFollows = document.querySelector("#num-of-follows");

const usersPerPage = 20;

let keyword = "";
let filteredUsers = [];
const users = JSON.parse(localStorage.getItem("followList"));

generatePaginator(users.length);
renderUsers(getUserbyPage(1));
numOfFollows.textContent = users.length;

function renderUsers(userData) {
    let HTMLContent = "";
    for (user of userData) {
      HTMLContent += `
      <div class="user-card card m-3" style="max-width: 280px; max-height: 94px;" data-set=${user.id}>
        <div class="row g-0">
          <div class="col-md-4">
            <div>
              <img src="${user.avatar}" class="img-fluid rounded-start" alt="user image">
            </div>
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <p class="card-title">${user.name + " " + user.surname}</p>
              <button type="button" class="btn btn-primary btn-sm btn-delete-follow" data-id="${user.id}">Unfollow</button>
              <button type="button" class="btn btn-light btn-sm btn-more" data-bs-toggle="modal" data-bs-target="#userInfoModal" data-id="${user.id}">More</button>
            </div>
          </div>
        </div>
      </div>`;
    }
    userPanel.innerHTML = HTMLContent;
}

function getUserbyPage(page) {
  const data = filteredUsers.length > 0 ? filteredUsers : users;
  const start = (page - 1) * usersPerPage; 
  const end = page * usersPerPage - 1;
  return data.slice(start, end + 1);
}

function showUserInfo(ID) {
    axios.get(index_URL + "/" + ID).then(function (response) {
      const data = response.data;
      const modalHTML = `<div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${data.name} ${data.surname}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex align-items-center">
            <img class="col-sm-4" src="${data.avatar}" alt="user image">
            <ul class="col-sm-8">
              <li><b>User ID:</b> ${data.id}</li>
              <li><b>Gender:</b> ${data.gender}</li>
              <li><b>Age:</b> ${data.age}</li>
              <li><b>Region:</b> ${data.region}</li>
              <li><b>Birthday:</b> ${data.birthday}</li>
              <li><b>Email:</b> ${data.email}</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>`;
      userInfoModal.innerHTML = modalHTML;
    });
}

function unfollow(ID) {
  const user = users.find(user => user.id === ID);
  const userIndex = users.findIndex(user => user.id === ID);

  users.splice(userIndex, 1);
  alert(`Unfollow: ${user.name} ${user.surname}`);

  localStorage.setItem("followList", JSON.stringify(users));
  renderUsers(getUserbyPage(1));
  numOfFollows.textContent = users.length;
}

function generatePaginator(num) {
  const numOfPage = Math.ceil(num / usersPerPage)
  let paginatorHTML = '';
  for (let i = 1; i <= numOfPage; i++) {
    paginatorHTML += `<li class="page-item"><a class="page-link" data-page="${i}" href="#">${i}</a></li>`;
  }
  paginator.innerHTML = paginatorHTML;
}

function startSearch(event) {
  keyword = searchInput.value.trim().toLowerCase();
  
  filteredUsers = users.filter(function searchName(user) {
    const name = user.name + user.surname;
    return name.toLowerCase().includes(keyword);
  })

  renderUsers(getUserbyPage(1));
  generatePaginator(filteredUsers.length);
}

userPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-more")) {
    showUserInfo(event.target.dataset.id);
  } else if (event.target.matches(".btn-delete-follow")) {
    unfollow(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName != 'A') return;
  const page = Number(event.target.dataset.page);
  renderUsers(getUserbyPage(page));
})

searchForm.addEventListener("keydown", startSearch);

searchForm.addEventListener("click", function clickOnSearch(event) {
  event.preventDefault();
  startSearch(event);
  if (filteredUsers.length === 0) alert('Cannot find user with the keyword: '+ keyword);
})