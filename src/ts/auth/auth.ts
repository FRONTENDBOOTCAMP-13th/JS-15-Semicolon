// @ts-ignore
import emailjs from "emailjs-com";

window.addEventListener("load", () => {
  if (typeof emailjs !== "undefined") {
    emailjs.init("eZvd0JYXSfS7EDwB2");
  } else {
    console.error("❌ emailjs is not loaded");
  }
});
// 페이지 로드 시 데이터 가져오기
const storedUserData = localStorage.getItem("userData");
const userData = storedUserData ? JSON.parse(storedUserData) : {};

// ==============================
// TODO : 📤 이메일 인증 관련 함수
// ==============================

function sendVerificationCode(email: string, code: string) {
  console.log("📩 보내는 이메일:", email);
  console.log("🔐 인증번호:", code);

  return emailjs.send("service_sief8rd", "template_w0jun3c", {
    to_email: email,
    from_name: "회원가입 시스템",
    message: `인증번호는 ${code}입니다.`,
  });
}

// 🚀 인증번호 생성
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
}

function startEmailVerification(email: string) {
  const code = generateCode();
  const expireAt = Date.now() + 3 * 60 * 1000; // 3분 후 만료

  localStorage.setItem("verificationCode", code);
  localStorage.setItem("verificationEmail", email);
  localStorage.setItem("verificationExpire", expireAt.toString());

  // 🔐 이메일 input 비활성화
  const emailInput = document.getElementById(
    "signupUsername"
  ) as HTMLInputElement;
  const messageEl = document.getElementById(
    "emailTimerMessage"
  ) as HTMLInputElement;

  emailInput.disabled = true;

  let timeLeft = 60;
  messageEl.textContent = `${timeLeft}초 후 다시 입력 가능합니다.`;

  const countdown = setInterval(() => {
    timeLeft--;
    messageEl.textContent = `${timeLeft}초 후 다시 입력 가능합니다.`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      emailInput.disabled = false;
      messageEl.textContent = `다시 이메일 입력이 가능합니다.`;
    }
  }, 1000);

  sendVerificationCode(email, code)
    .then(() => alert("인증번호가 이메일로 전송되었습니다."))
    .catch(() => alert("이메일 전송 실패"));
}

function verifyCode(inputCode: string): boolean {
  const savedCode = localStorage.getItem("verificationCode");
  const savedExpire = Number(localStorage.getItem("verificationExpire"));

  if (Date.now() > savedExpire) {
    alert("인증번호가 만료되었습니다.");
    return false;
  }

  if (inputCode !== savedCode) {
    alert("인증번호가 일치하지 않습니다.");
    return false;
  }

  return true;
}

// ==============================
// TODO : 📌 전역 함수로 노출 (onclick에서 호출 가능하게)
// ==============================

function sendVerification() {
  const email = (document.getElementById("signupUsername") as HTMLInputElement)
    .value;
  if (!email.includes("@")) {
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }
  startEmailVerification(email);
}

function verifyCodeUI() {
  const input = (
    document.getElementById("verificationCode") as HTMLInputElement
  ).value;
  verifyCode(input);
}

// ==============================
// TODO : 🔐 로그인
// ==============================

function login() {
  const username = (
    document.getElementById("loginUsername") as HTMLInputElement
  ).value;
  const password = (
    document.getElementById("loginPassword") as HTMLInputElement
  ).value;

  if (userData[username] && userData[username].password === password) {
    alert("Login successful");
    window.location.href = "/src/components/card.html";
    localStorage.setItem("loggedInUser", username);
  } else {
    alert("Invalid username or password");
  }
}

// ==============================
// TODO : 📝 회원가입
// ==============================

function signup() {
  const username = (
    document.getElementById("signupUsername") as HTMLInputElement
  ).value;
  const password = (
    document.getElementById("signupPassword") as HTMLInputElement
  ).value;
  const passwordCheck = (
    document.getElementById("signupPasswordCheck") as HTMLInputElement
  ).value;

  if (!username.includes("@")) {
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  const pwValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@!])[A-Za-z\d@!]{10,}$/.test(
    password
  );

  if (!pwValid) {
    alert(
      "비밀번호는 영문, 숫자, 특수문자(@, !)를 포함해 10자 이상이어야 합니다."
    );
    return;
  }

  // 비밀번호 일치 여부 검사
  if (password !== passwordCheck) {
    alert("비밀번호가 일치하지 않습니다");
    return;
  }

  if (userData[username]) {
    alert("Username already exists");
  } else {
    userData[username] = { password: password };
    console.log("Signup successful");

    localStorage.setItem("userData", JSON.stringify(userData));
    window.location.href = "login.html";
  }
}

// ==============================
// 🌐 전역 등록
// ==============================

(window as any).sendVerification = sendVerification;
(window as any).verifyCode = verifyCodeUI;
(window as any).signup = signup;
(window as any).login = login;
