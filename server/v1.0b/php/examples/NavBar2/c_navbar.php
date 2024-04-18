<!-- bootstrap navbar -->
<div class="container-fluid">
    <ul class="navbar-nav">
        <!-- we will use navItem as a class selector of all nav items                                       -->
        <!-- we will add the 'active' class to specific nav items based on the class name navItem-[navname] -->
        <!-- we've added a custom attribute 'navname' we will read to set items as active                   -->
        <li class="nav-item">
            <span class="navItem navItem-home       nav-link btn btn-light" bind-events="click" navname="home">Home</span>
        </li> 
        <li class="nav-item">
            <span class="navItem navItem-customers  nav-link btn btn-light" bind-events="click" navname="customers">Customers</span>
        </li>
        <li class="nav-item">
            <span class="navItem navItem-films      nav-link btn btn-light" bind-events="click" navname="films">Films</span>
        </li>
    </ul>
</div>