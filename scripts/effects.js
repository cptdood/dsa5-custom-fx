// enable to show all hooks in debug mode
// CONFIG.debug.hooks = true


var spellLookup = [
    {title: "Ignifaxius", renderType: "projectile", scale: 1, filename: "modules/JB2A_DnD5e/Library/Generic/Fire/FireJet_01_Orange_30ft_1200x200.webm"},
    {title: "Balsam Salabunde", renderType: "ontarget", scale: 1, filename: "modules/JB2A_DnD5e/Library/Generic/Healing/HealingAbility_01_Green_200x200.webm"},
    {title: "Armatrutz", renderType: "ontarget", scale: 0.8, filename: "modules/JB2A_DnD5e/Library/5th_Level/Antilife_Shell/AntilifeShell_01_Blue_NoCircle_400x400.webm"},
    {title: "Hexengalle", renderType: "projectile", scale: 1, filename: "modules/JB2A_DnD5e/Library/Generic/Template/Line/Breath_Weapon/BreathWeapon_Acid01_Regular_Green_30ft_Line_Burst_1200x200.webm"},
    {title: "Hexenkrallen", renderType: "ontarget", scale: 1, filename: "modules/JB2A_DnD5e/Library/Generic/Creature/Claws_01_Regular_Red_200x200.webm"},
    {title: "Invocatio Maxima", renderType: "custom"}
]

var combatSkillLookup = {
    Dolche: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm",
    Raufen: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Magical01_800x600.webm",
    Ringen: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Magical01_800x600.webm",
    Hiebwaffen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/HandAxe02_01_Regular_White_800x600.webm", //modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Mace01_01_Regular_White_800x600.webm
    Zweihandhiebwaffen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/GreatAxe01_01_Regular_White_800x600.webm", //modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Maul01_01_Regular_White_800x600.webm
    Zweihandschwerter: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/GreatSword01_01_Regular_White_800x600.webm",
    Fechtwaffen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Rapier01_01_Regular_White_800x600.webm",
    Schwerter: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm",
    Stangenwaffen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_01_Regular_White_800x600.webm",
    Spießwaffen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_01_Regular_White_800x600.webm"

}

var ammoLookup = {
    Pfeil: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_30ft_1600x400.webm",
    Bolzen: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_30ft_1600x400.webm",
    Wurfwaffe: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Dagger01_01_Regular_White_30ft_1600x400.webm"
    //Wurfspeer: ""
}


Hooks.on("postProcessDSARoll", function(message, result, p3, p4) {
  console.log(message);
  console.log(result);
  console.log(p3);
  console.log(p4);

// successLevel:
// +3 bestätigter kritischer Erfolg
// +2 unbestätigter kritischer Erfolg
// +1 Erfolg
// -1 Misserfolg
// -2 unbestätigter Patzer
// -3 bestätigter Patzer
  
  if ((result.rollType == "spell") && (result.successLevel > 0)) {

    spellLookup.forEach(el => {

        if (message.title.includes(el.title)) {
            renderSpell(el);
            return;
        }

    });    

  }
  else if (result.rollType == "weapon") {

    // ranged
    if (result.ammo) {
        renderProjectile(ammoLookup[result.ammo.name], 1, result.successLevel < 0);
    }
    // melee (but only for confirmed crits)
    else if (result.successLevel == 3) {

        // wait async until combat skill variable is set
        (async() => {
            while(!message["flags.data"])
                await new Promise(resolve => setTimeout(resolve, 1000));

                let combatSkill = message["flags.data"].preData.source.data.combatskill.value;

                console.log(combatSkill);
                renderProjectile(combatSkillLookup[combatSkill], 1);
        })();
    }

  }
});


function renderSpell(o) {
    if (o.renderType == "projectile") {
        renderProjectile(o.filename, o.scale);
    }
    else if (o.renderType == "ontarget") {
        renderOnTarget(o.filename, o.scale);
    }
    else if (o.renderType == "ontoken") {
        renderOnToken(o.filename, o.scale);
    }
    else if (o.renderType == "custom") {
        renderCustom(o.title);
    }
}

function renderProjectile(filename, scale, missed = false) {
    
    new Sequence()
        .effect()
        .file(filename)
        .atLocation(canvas.tokens.controlled[0])
        .reachTowards(game.user.targets.values().next().value)
        .JB2A()
        .missed(missed)
        .scale(scale)
        .play()
}

function renderOnTarget(filename, scale) {
    
    new Sequence()
        .effect()
        .file(filename)
        .atLocation(game.user.targets.values().next().value)
        .JB2A()
        .scale(scale)
        .play()
}

function renderOnToken(filename, scale) {
    
    new Sequence()
        .effect()
        .file(filename)
        .atLocation(canvas.tokens.controlled[0])
        .JB2A()
        .scale(scale)
        .play()
}

function renderCustom(title) {

    if (title == "Invocatio Maxima") {
        new Sequence()
            .effect()
            .file("modules/JB2A_DnD5e/Library/Generic/Magic_Signs/Conjuration_01_Yellow_Circle_800x800.webm")
            .atLocation(canvas.tokens.controlled[0])
            .JB2A()
            .scale(0.5)
            .belowTokens()
            .fadeIn(1500, {ease: "easeOutCubic", delay: 500})
            .fadeOut(1500)
            .rotateIn(90, 2500, {ease: "easeInOutCubic"})
            .rotateOut(350, 1500, {ease: "easeInCubic"})
            .scaleIn(0.5, 2500, {ease: "easeInOutCubic"})
            .scaleOut(0, 1500, {ease: "easeInCubic"})
            .play()
    }
    else if (title == "Invocatio Minima") {
        new Sequence()
            .effect()
            .file("modules/JB2A_DnD5e/Library/Generic/Magic_Signs/Conjuration_01_Yellow_Circle_800x800.webm")
            .atLocation(canvas.tokens.controlled[0])
            .JB2A()
            .scale(0.25)
            .belowTokens()
            .fadeIn(1500, {ease: "easeOutCubic", delay: 500})
            .fadeOut(1500)
            .rotateIn(90, 2500, {ease: "easeInOutCubic"})
            .rotateOut(350, 1500, {ease: "easeInCubic"})
            .scaleIn(0.5, 2500, {ease: "easeInOutCubic"})
            .scaleOut(0, 1500, {ease: "easeInCubic"})
            .play()
    }
}


function renderCasterToTarget() {
    //This macro plays the animation on selected targets with a trajectory and distances of 30ft, 60ft and 90ft
    //It works for animations like Scorching Ray, Fire Bolt, Arrow, Boulder Toss, Siege Projectile that use these distances
    //Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Ray Of Frost Blue").
    //If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.

    //folder 01 is the directory path to the assets
    // let folder01 = "modules/JB2A_DnD5e/Library/2nd_Level/Scorching_Ray/";
    //anFile30 points to the file corresponding to 30ft, anFile60 for 60ft and anFile90 for 90ft
    // let anFile30 = `${folder01}ScorchingRay_01_Regular_Orange_30ft_1600x400.webm`;
    // let anFile60 = `${folder01}ScorchingRay_01_Regular_Orange_60ft_2800x400.webm`;
    // let anFile90 = `${folder01}ScorchingRay_01_Regular_Orange_90ft_4000x400.webm`;

    //How this macro is set up for Fire Bolt
    let folder01 = "modules/JB2A_DnD5e/Library/Cantrip/Fire_Bolt/";
    let anFile30 = `${folder01}FireBolt_01_Regular_Orange_30ft_1600x400.webm`;
    let anFile60 = `${folder01}FireBolt_01_Regular_Orange_60ft_2800x400.webm`;
    let anFile90 = `${folder01}FireBolt_01_Regular_Orange_90ft_4000x400.webm`;


    if(game.user.targets.size == 0) ui.notifications.error('You must target at least one token');
    if(canvas.tokens.controlled.length == 0) ui.notifications.error("Please select your token");
    ///Check if Module dependencies are installed or returns an error to the user
    if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");

    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    async function Cast() {
        var myStringArray = Array.from(game.user.targets)[0];
        var arrayLength = game.user.targets.size;
        for (var i = 0; i < arrayLength; i++) {

        let mainTarget = Array.from(game.user.targets)[i];
        let myToken = canvas.tokens.controlled [0];

        let ray = new Ray(myToken.center, mainTarget.center);
        let anDeg = -(ray.angle * 57.3);
        let anDist = ray.distance;


        let anFile = anFile30;
        let anFileSize = 1200;
        let anchorX = 0.125;
        switch(true){
        case (anDist<=1200):
            anFileSize = 1200;
            anFile = anFile30;
            anchorX = 0.125;
            break;
        case (anDist>2400):
            anFileSize = 3600;
            anFile = anFile90;
            anchorX = 0.05;
            break;
        default:
            anFileSize = 2400;
            anFile = anFile60;
            anchorX = 0.071;
            break;
        }

        let anScale = anDist / anFileSize;
        let anScaleY = anDist <= 600 ? 0.6  : anScale;

        let spellAnim = 
                            {
                            file: anFile,
                            position: myToken.center,
                            anchor: {
                            x: anchorX,
                            y: 0.5
                            },
                            angle: anDeg,
                            scale: {
                            x: anScale,
                            y: anScaleY
                            }
                            }; 

        if (game.data.version.includes("0.8.")) {
            canvas.specials.playVideo(spellAnim);
            game.socket.emit('module.fxmaster', spellAnim);
            } else {
            canvas.fxmaster.playVideo(spellAnim);
            game.socket.emit('module.fxmaster', spellAnim);
            }
        await wait (250);
        }
    }
    Cast ()
}