const popUp = document.getElementById("popUp")

export async function displaySongInfo(e) {
    let token = localStorage.getItem("accessToken");
    let linkExt = e.target.id
    let fullLink = "https://api.spotify.com/v1/" + linkExt

    const result = await fetch(fullLink, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    makePopUp(await result.json())   
}

function makePopUp(info) {
    console.log(info)

    popUp.style.display = "flex"
}