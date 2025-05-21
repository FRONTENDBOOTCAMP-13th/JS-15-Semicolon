export function initAuthBtn() {
  document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("authBtn") as HTMLAnchorElement;
    if (!authBtn) return;

    function updateAuthButton() {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if (loggedInUser) {
        authBtn.textContent = "로그아웃";
        authBtn.href = "#";
      } else {
        authBtn.textContent = "로그인";
        authBtn.href = "/src/components/login.html";
      }
    }

    authBtn.addEventListener("click", (e) => {
      if (authBtn.textContent === "로그아웃") {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        alert("로그아웃 되었습니다.");
        location.reload();
      }
    });

    updateAuthButton();
  });
}

initAuthBtn();
