export const successEmail = (name: string, email: string) => {
  return {
    from: {
      name: "Micael",
      address: "contact@micaelblog.com",
    },
    to: {
      name: name,
      address: email,
    },
    subject: `Welcome to Micael's Blog!`,
    html: `
        <div
          style="
            font-family: sans-serif;
            max-width: 400px;
            margin: 2rem auto;
            padding: 1rem;
            border-radius: 0.5rem;
          "
        >
          <h2>Hello ${name}, your account was created successfully!</h2>
          <p style="padding: 1rem 0; line-height: 2rem">
            Now you can enjoy our blog as a proper user and interact with the other
            users. Click in the link below to go to the blog.
          </p>
          <a href="#" target="_blank" style="color: black"> Micael's Blog </a>
        </div>`.trim(),
  };
};
