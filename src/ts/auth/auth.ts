document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("button");
  loginBtn?.addEventListener("click", login);
});

// 페이지 로드 시 데이터 가져오기
const storedUserData = localStorage.getItem("userData");
const userData = storedUserData ? JSON.parse(storedUserData) : {};

function login() {
  const username = (
    document.getElementById("loginUsername") as HTMLInputElement
  ).value;
  const password = (
    document.getElementById("loginPassword") as HTMLInputElement
  ).value;

  if (userData[username] && userData[username].password === password) {
    alert("Login successful");
  } else {
    // 로그인 실패 시 alert 창 표시
    alert("Invalid username or password");
  }
}

function signup() {
  const username = (
    document.getElementById("signupUsername") as HTMLInputElement
  ).value;
  const password = (
    document.getElementById("signupPassword") as HTMLInputElement
  ).value;

  // 이미 존재하는 사용자인지 확인
  if (userData[username]) {
    alert("Username already exists");
  } else {
    // 새로운 사용자를 저장
    userData[username] = { password: password };
    console.log("Signup successful");

    // 회원가입 성공 시 로그인 페이지로 리디렉션
    window.location.href = "login.html";

    // 회원가입 시 사용자 데이터를 로컬 스토리지에 저장
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

function showUserData() {
  console.log(JSON.stringify(userData));
}
