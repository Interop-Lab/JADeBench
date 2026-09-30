function Main(input) {
    var daysRemaining;

    switch (input) {
        case "SUN":
            daysRemaining = "7";
            break;
        case "MON":
            daysRemaining = "6";
            break;
        case "TUE":
            daysRemaining = "5";
            break;
        case "WED":
            daysRemaining = "4";
            break;
        case "THU":
            daysRemaining = "3";
            break;
        case "FRI":
            daysRemaining = "2";
            break;
        case "SAT":
            daysRemaining = "1";
            break;
    }

    console.log(daysRemaining);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
