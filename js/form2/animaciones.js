const groups = document.querySelectorAll(".input-group.floating");

        groups.forEach(group => {
            const input = group.querySelector("input");
            const label = group.querySelector("label");

            const subirLabel = () => {
                group.classList.add("active");

                anime({
                    targets: label,
                    top: "0px",
                    translateY: "-55%",
                    duration: 300,
                    easing: "easeOutQuad"
                });
            };


            // Hover
            input.addEventListener("mouseenter", subirLabel);

            // Focus (más importante)
            input.addEventListener("focus", subirLabel);


        });