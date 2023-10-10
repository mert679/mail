document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = compose_submit

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${mailbox}`)
  .then((response)=>{return response.json()})
  .then((mails)=>{

    for (let i = 0; i < mails.length; i++) {
      const mail = mails[i];
      const mail_body = document.createElement("div")
      mail_body.classList = "mail_result"
      mail_body.innerHTML = `
      <div class="head_mail"> <div><b>Subject:</b> ${mail.subject} </div>  <span><b>Sender:</b>${mail.sender}</span> ${mail.timestamp}</div>
      `
    
        mail_body.addEventListener("click",()=>{load_mail(mails[i].id,mailbox)})
      
      
      if(mail.read== true){
        mail_body.style.backgroundColor = "gray"
      }
      else{
        mail_body.style.backgroundColor = "white"
      }
      document.querySelector('#emails-view').appendChild(mail_body) 
      document.querySelector('#email-view').style.display = 'none';
    }
})

function load_mail(id,mailbox) {
  


    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';

    fetch(`emails/${id}`,{
      method:"PUT",
      body: JSON.stringify({
        read:true
      })

    })

  
    fetch(`emails/${id}`)
    .then((response)=>{return response.json()})
    .then((email)=>{
      document.querySelector('#email-view').innerHTML = `
              <div><b>From:</b> ${email.sender}</div>
              <div><b>To:</b> ${email.recipients}</div>
              <div><b>Subject:</b> ${email.subject}</div>
              <div><b>Timestamp:</b> ${email.timestamp}</div>            
              
              <div class="email-buttons">
                  <button class="btn-email" id="reply">Reply</button>
                  <button class="btn-email" id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
              </div>
              <hr>
              <div>
                <b>Body:</b> <br>
                  ${email.body}
              </div>
              
            `
            document.querySelector('#archive').addEventListener("click",()=>{
              fetch(`emails/${id}`,{
                method:"PUT",
                body:JSON.stringify({
                  archived:!email.archived
                })
              }).then(() => {
                
                load_mailbox('inbox');
              });
            })
            console.log(email);
            document.querySelector("#reply").addEventListener("click",()=>{
              document.querySelector('#email-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';
              
              document.querySelector('#compose-recipients').value = `${email.recipients}`;
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
              document.querySelector('#compose-subject').disabled = true;
              document.querySelector('#compose-body').value = `${email.body}`;
            
            })
    })


  

 
}

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


}

function compose_submit() {
  const compose_recipients = document.querySelector('#compose-recipients').value
  const compose_subject = document.querySelector('#compose-subject').value
  const compose_body =  document.querySelector('#compose-body').value
  fetch("/emails",{
    method:"POST",
    body:JSON.stringify({
      recipients:compose_recipients,
      subject:compose_subject,
      body:compose_body
    })
  })
  .then((response)=>{
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }
    return response.json()
  })
  .then(()=>{
    load_mailbox("sent")
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  return false
}
