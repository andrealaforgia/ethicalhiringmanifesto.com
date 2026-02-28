(function () {
  "use strict";

  const PAGE_SIZE = 20;
  let offset = 0;
  let total = 0;

  const form = document.getElementById("sign-form");
  const feedback = document.getElementById("form-feedback");
  const submitBtn = document.getElementById("submit-btn");
  const messageInput = document.getElementById("message");
  const charCount = document.getElementById("char-count");
  const list = document.getElementById("signatories-list");
  const countEl = document.getElementById("signatories-count");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Character counter
  messageInput.addEventListener("input", function () {
    charCount.textContent = this.value.length + " / 500";
  });

  // Load signatures
  async function loadSignatures(append) {
    try {
      const res = await fetch(
        "api/signatures?limit=" + PAGE_SIZE + "&offset=" + offset
      );
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      total = data.total;

      if (!append) {
        list.innerHTML = "";
      }

      data.signatures.forEach(function (sig) {
        var li = document.createElement("li");

        var nameSpan = document.createElement("span");
        nameSpan.className = "signatory-name";
        nameSpan.textContent = sig.first_name + " " + sig.last_name;
        li.appendChild(nameSpan);

        var dateSpan = document.createElement("span");
        dateSpan.className = "signatory-date";
        dateSpan.textContent =
          " — " +
          new Date(sig.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        li.appendChild(dateSpan);

        if (sig.message) {
          var msgSpan = document.createElement("span");
          msgSpan.className = "signatory-message";
          msgSpan.textContent = '"' + sig.message + '"';
          li.appendChild(msgSpan);
        }

        list.appendChild(li);
      });

      if (total === 0) {
        countEl.textContent = "No signatures yet. Be the first to sign!";
      } else {
        countEl.textContent =
          total + (total === 1 ? " signatory" : " signatories");
      }

      offset += data.signatures.length;
      loadMoreBtn.style.display = offset < total ? "" : "none";
    } catch (err) {
      console.error(err);
    }
  }

  // Load more
  loadMoreBtn.addEventListener("click", function () {
    loadSignatures(true);
  });

  // Form submit
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedback.textContent = "";
    feedback.className = "";

    var firstName = form.first_name.value.trim();
    var lastName = form.last_name.value.trim();
    var message = form.message.value.trim();

    if (!firstName || !lastName) {
      feedback.textContent = "Please enter your first and last name.";
      feedback.className = "error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      var res = await fetch("api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          message: message || undefined,
        }),
      });

      var data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      feedback.textContent = data.message;
      feedback.className = "success";
      form.reset();
      charCount.textContent = "0 / 500";
    } catch (err) {
      feedback.textContent = err.message;
      feedback.className = "error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign the Manifesto";
    }
  });

  // Initial load
  loadSignatures(false);
})();
