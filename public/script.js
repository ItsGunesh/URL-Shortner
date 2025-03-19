const form = document.getElementById("shorten-form").addEventListener('submit' , async(event)=>{

    event.preventDefault()
    const formData = new FormData(event.target)

    const url = formData.get("url")
    const shortCode = formData.get("shortCode")
    // console.log(url , shortCode)

    const fetchShortenURL =async () =>{
        const response = await fetch("/links")
        const links =  await response.json()
        console.log("links:" , links)

        const list = document.getElementById("shortned-urls")
        list.innerHTML = ""

        for(const[shortCode,url] of Object.entries(links)){
            console.log(`${shortCode} : ${url}`)
            const li = document.createElement("li")
            li.innerHTML = `<a href="/${shortCode}" target="_blank"> ${window.location.origin}/${shortCode}</a> - ${url}`
            list.appendChild(li)
            
        }
    }

    try {
       const response =  await fetch("/shorten",{
        method : "POST",
        headers : {"Content-Type":"application/json"},
        body : JSON.stringify({url , shortCode})
       })

       if(response.ok){
        fetchShortenURL()
        alert("Form submitted succesfully")
        event.target.reset()
       }
       else {
        const errorMessage = await response.text();
        alert(errorMessage)
       }
    } catch (error) {
        console.log(error)
    }
    
    fetchShortenURL()
    
})