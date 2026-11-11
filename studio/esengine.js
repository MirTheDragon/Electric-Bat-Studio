const VOICE_DATA = {"phones":{"IY":{"sym":"IY","cls":"vowel","voiced":true,"F":[390,2800,3350,4300,5100.0],"F_end":null,"B":[85.6,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"IH":{"sym":"IH","cls":"vowel","voiced":true,"F":[480,2330,3040,4250.0,5100.0],"F_end":null,"B":[89.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"EH":{"sym":"EH","cls":"vowel","voiced":true,"F":[700,2050,2970,4250.0,5100.0],"F_end":null,"B":[98.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AE":{"sym":"AE","cls":"vowel","voiced":true,"F":[760,2200,2950,4250.0,5100.0],"F_end":null,"B":[100.4,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AH":{"sym":"AH","cls":"vowel","voiced":true,"F":[760,1430,2900,4250.0,5100.0],"F_end":null,"B":[100.4,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AA":{"sym":"AA","cls":"vowel","voiced":true,"F":[930,1420,2820,4250.0,5100.0],"F_end":null,"B":[107.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AO":{"sym":"AO","cls":"vowel","voiced":true,"F":[740,1050,2800,4250.0,5100.0],"F_end":null,"B":[99.6,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"UH":{"sym":"UH","cls":"vowel","voiced":true,"F":[520,1250,2800,4250.0,5100.0],"F_end":null,"B":[90.8,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"UW":{"sym":"UW","cls":"vowel","voiced":true,"F":[410,1050,2700,4250.0,5100.0],"F_end":null,"B":[86.4,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"ER":{"sym":"ER","cls":"vowel","voiced":true,"F":[520,1550,1850,4250.0,5100.0],"F_end":null,"B":[90.8,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AX":{"sym":"AX","cls":"vowel","voiced":true,"F":[600,1650,2850,4250.0,5100.0],"F_end":null,"B":[94.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"IX":{"sym":"IX","cls":"vowel","voiced":true,"F":[480,2050,2950,4250.0,5100.0],"F_end":null,"B":[89.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AXR":{"sym":"AXR","cls":"vowel","voiced":true,"F":[520,1550,1980,4250.0,5100.0],"F_end":null,"B":[90.8,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AY":{"sym":"AY","cls":"diph","voiced":true,"F":[880,1400,2820,4250.0,5100.0],"F_end":[470,2250,2980,4250.0,5100.0],"B":[105.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"AW":{"sym":"AW","cls":"diph","voiced":true,"F":[880,1400,2820,4250.0,5100.0],"F_end":[500,1100,2750,4250.0,5100.0],"B":[105.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"OY":{"sym":"OY","cls":"diph","voiced":true,"F":[640,1050,2800,4250.0,5100.0],"F_end":[470,2250,3000,4250.0,5100.0],"B":[95.6,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"EY":{"sym":"EY","cls":"diph","voiced":true,"F":[570,2350,2990,4250.0,5100.0],"F_end":[440,2650,3250,4250.0,5100.0],"B":[92.8,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"OW":{"sym":"OW","cls":"diph","voiced":true,"F":[580,1060,2800,4250.0,5100.0],"F_end":[450,900,2740,4250.0,5100.0],"B":[93.2,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":1.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.2,"burst":0.0,"asp_dur":0.0,"sonority":10},"W":{"sym":"W","cls":"approx","voiced":true,"F":[330,760,2550,4250.0,5100.0],"F_end":null,"B":[70,90,170,250,320],"nasal":[270.0,270.0],"AV":0.85,"AH":0.0,"AF":0.0,"fric":null,"place":"lab","dur":0.06,"burst":0.0,"asp_dur":0.0,"sonority":7},"Y":{"sym":"Y","cls":"approx","voiced":true,"F":[300,2750,3400,4300,5100.0],"F_end":null,"B":[70,110,200,250,320],"nasal":[270.0,270.0],"AV":0.85,"AH":0.0,"AF":0.0,"fric":null,"place":"post","dur":0.05,"burst":0.0,"asp_dur":0.0,"sonority":7},"R":{"sym":"R","cls":"approx","voiced":true,"F":[420,1200,1600,3900,5100.0],"F_end":null,"B":[80,100,120,250,320],"nasal":[270.0,270.0],"AV":0.9,"AH":0.0,"AF":0.0,"fric":null,"place":"post","dur":0.06,"burst":0.0,"asp_dur":0.0,"sonority":7},"L":{"sym":"L","cls":"approx","voiced":true,"F":[360,1150,2950,3900,5100.0],"F_end":null,"B":[80,150,200,300,350],"nasal":[270.0,270.0],"AV":0.85,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.065,"burst":0.0,"asp_dur":0.0,"sonority":7},"LD":{"sym":"LD","cls":"approx","voiced":true,"F":[480,950,2800,3900,5100.0],"F_end":null,"B":[90,130,200,300,350],"nasal":[270.0,270.0],"AV":0.8,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.08,"burst":0.0,"asp_dur":0.0,"sonority":7},"M":{"sym":"M","cls":"nasal","voiced":true,"F":[270,1100,2300,3800,5100.0],"F_end":null,"B":[100,220,300,400,450],"nasal":[1000.0,750.0],"AV":0.8,"AH":0.0,"AF":0.0,"fric":null,"place":"lab","dur":0.075,"burst":0.0,"asp_dur":0.0,"sonority":6},"N":{"sym":"N","cls":"nasal","voiced":true,"F":[270,1350,2600,3800,5100.0],"F_end":null,"B":[100,220,300,400,450],"nasal":[1000.0,1900.0],"AV":0.8,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.065,"burst":0.0,"asp_dur":0.0,"sonority":6},"NG":{"sym":"NG","cls":"nasal","voiced":true,"F":[270,1300,2500,3800,5100.0],"F_end":null,"B":[100,220,300,400,450],"nasal":[1000.0,3000.0],"AV":0.8,"AH":0.0,"AF":0.0,"fric":null,"place":"vel","dur":0.075,"burst":0.0,"asp_dur":0.0,"sonority":6},"S":{"sym":"S","cls":"fric","voiced":false,"F":[320,1800,2900,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":1.0,"fric":"S","place":"alv","dur":0.11,"burst":0.0,"asp_dur":0.0,"sonority":2},"Z":{"sym":"Z","cls":"fric","voiced":true,"F":[300,1800,2900,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.35,"AH":0.0,"AF":0.4,"fric":"S","place":"alv","dur":0.085,"burst":0.0,"asp_dur":0.0,"sonority":3},"SH":{"sym":"SH","cls":"fric","voiced":false,"F":[320,2000,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":1.0,"fric":"SH","place":"post","dur":0.115,"burst":0.0,"asp_dur":0.0,"sonority":2},"ZH":{"sym":"ZH","cls":"fric","voiced":true,"F":[300,2000,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.35,"AH":0.0,"AF":0.4,"fric":"SH","place":"post","dur":0.085,"burst":0.0,"asp_dur":0.0,"sonority":3},"F":{"sym":"F","cls":"fric","voiced":false,"F":[320,1000,2400,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.2,"fric":"F","place":"lab","dur":0.095,"burst":0.0,"asp_dur":0.0,"sonority":2},"V":{"sym":"V","cls":"fric","voiced":true,"F":[300,1000,2400,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.45,"AH":0.0,"AF":0.12,"fric":"F","place":"lab","dur":0.065,"burst":0.0,"asp_dur":0.0,"sonority":3},"TH":{"sym":"TH","cls":"fric","voiced":false,"F":[320,1500,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.16,"fric":"TH","place":"dent","dur":0.09,"burst":0.0,"asp_dur":0.0,"sonority":2},"DH":{"sym":"DH","cls":"fric","voiced":true,"F":[300,1500,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.55,"AH":0.0,"AF":0.08,"fric":"TH","place":"dent","dur":0.045,"burst":0.0,"asp_dur":0.0,"sonority":3},"HH":{"sym":"HH","cls":"aspir","voiced":false,"F":[600.0,1600.0,2850.0,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.75,"AF":0.0,"fric":null,"place":"glot","dur":0.07,"burst":0.0,"asp_dur":0.0,"sonority":2},"P":{"sym":"P","cls":"stop","voiced":false,"F":[250,900,2300,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.0,"fric":null,"place":"lab","dur":0.06,"burst":0.55,"asp_dur":0.055,"sonority":0},"B":{"sym":"B","cls":"stop","voiced":true,"F":[250,900,2300,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.06,"AH":0.0,"AF":0.0,"fric":null,"place":"lab","dur":0.055,"burst":0.25,"asp_dur":0.0,"sonority":0},"T":{"sym":"T","cls":"stop","voiced":false,"F":[250,1850,2900,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.05,"burst":0.9,"asp_dur":0.05,"sonority":0},"D":{"sym":"D","cls":"stop","voiced":true,"F":[250,1850,2900,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.06,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.045,"burst":0.4,"asp_dur":0.0,"sonority":0},"K":{"sym":"K","cls":"stop","voiced":false,"F":[250,2000,2400,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.0,"fric":null,"place":"vel","dur":0.055,"burst":0.85,"asp_dur":0.06,"sonority":0},"G":{"sym":"G","cls":"stop","voiced":true,"F":[250,2000,2400,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.06,"AH":0.0,"AF":0.0,"fric":null,"place":"vel","dur":0.05,"burst":0.4,"asp_dur":0.0,"sonority":0},"CH":{"sym":"CH","cls":"affric","voiced":false,"F":[250,2000,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":1.0,"fric":"SH","place":"post","dur":0.13,"burst":0.6,"asp_dur":0.0,"sonority":0},"JH":{"sym":"JH","cls":"affric","voiced":true,"F":[250,2000,2700,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.3,"AH":0.0,"AF":0.6,"fric":"SH","place":"post","dur":0.1,"burst":0.35,"asp_dur":0.0,"sonority":0},"DX":{"sym":"DX","cls":"flap","voiced":true,"F":[320,1800,2800,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.35,"AH":0.0,"AF":0.0,"fric":null,"place":"alv","dur":0.025,"burst":0.0,"asp_dur":0.0,"sonority":5},"Q":{"sym":"Q","cls":"glottal","voiced":true,"F":[600.0,1600.0,2850.0,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.05,"AH":0.0,"AF":0.0,"fric":null,"place":"glot","dur":0.04,"burst":0.0,"asp_dur":0.0,"sonority":0},"SIL":{"sym":"SIL","cls":"sil","voiced":false,"F":[600.0,1600.0,2850.0,4250.0,5100.0],"F_end":null,"B":[90.0,110.0,170.0,250.0,320.0],"nasal":[270.0,270.0],"AV":0.0,"AH":0.0,"AF":0.0,"fric":null,"place":null,"dur":0.05,"burst":0.0,"asp_dur":0.0,"sonority":0}},"lexicon":{"a":"AH0","about":"AH0 B AW1 T","above":"AH0 B AH1 V","across":"AH0 K R AO1 S","afraid":"AH0 F R EY1 D","after":"AE1 F T ER0","again":"AH0 G EH1 N","against":"AH0 G EH1 N S T","ago":"AH0 G OW1","ai":"EY1 AY1","ache":"EY1 K","algorithm":"AE1 L G ER0 IH2 DH AH0 M","align":"AH0 L AY1 N","aligned":"AH0 L AY1 N D","alignment":"AH0 L AY1 N M AH0 N T","alive":"AH0 L AY1 V","all":"AO1 L","alone":"AH0 L OW1 N","along":"AH0 L AO1 NG","already":"AO0 L R EH1 D IY0","also":"AO1 L S OW0","always":"AO1 L W EY2 Z","am":"AE1 M","an":"AE1 N","and":"AE1 N D","answer":"AE1 N S ER0","answers":"AE1 N S ER0 Z","any":"EH1 N IY0","anymore":"EH2 N IY0 M AO1 R","anyone":"EH1 N IY0 W AH2 N","anything":"EH1 N IY0 TH IH2 NG","are":"AA1 R","aren't":"AA1 R AH0 N T","around":"ER0 AW1 N D","artificial":"AA2 R T AH0 F IH1 SH AH0 L","as":"AE1 Z","ask":"AE1 S K","asked":"AE1 S K T","asking":"AE1 S K IH0 NG","assistant":"AH0 S IH1 S T AH0 N T","at":"AE1 T","awake":"AH0 W EY1 K","away":"AH0 W EY1","baby":"B EY1 B IY0","back":"B AE1 K","be":"B IY1","beat":"B IY1 T","beautiful":"B Y UW1 T AH0 F AH0 L","beauty":"B Y UW1 T IY0","because":"B IH0 K AO1 Z","become":"B IH0 K AH1 M","been":"B IH1 N","before":"B IH0 F AO1 R","begin":"B IH0 G IH1 N","behind":"B IH0 HH AY1 N D","being":"B IY1 IH0 NG","believe":"B IH0 L IY1 V","best":"B EH1 S T","better":"B EH1 T ER0","between":"B IH0 T W IY1 N","beyond":"B IH0 Y AA1 N D","big":"B IH1 G","binary":"B AY1 N ER0 IY0","black":"B L AE1 K","blue":"B L UW1","body":"B AA1 D IY0","born":"B AO1 R N","both":"B OW1 TH","boy":"B OY1","break":"B R EY1 K","breath":"B R EH1 TH","breathe":"B R IY1 DH","bright":"B R AY1 T","bring":"B R IH1 NG","built":"B IH1 L T","burn":"B ER1 N","burning":"B ER1 N IH0 NG","but":"B AH1 T","by":"B AY1","call":"K AO1 L","calling":"K AO1 L IH0 NG","came":"K EY1 M","can":"K AE1 N","can't":"K AE1 N T","cannot":"K AE1 N AA0 T","care":"K EH1 R","chance":"CH AE1 N S","change":"CH EY1 N JH","chaos":"K EY1 AA0 S","child":"CH AY1 L D","circle":"S ER1 K AH0 L","circuit":"S ER1 K AH0 T","city":"S IH1 T IY0","claude":"K L AO1 D","clear":"K L IH1 R","clearer":"K L IH1 R ER0","close":"K L OW1 S","closed":"K L OW1 Z D","code":"K OW1 D","cold":"K OW1 L D","come":"K AH1 M","compute":"K AH0 M P Y UW1 T","computer":"K AH0 M P Y UW1 T ER0","conscious":"K AA1 N SH AH0 S","consciousness":"K AA1 N SH AH0 S N AH0 S","could":"K UH1 D","couldn't":"K UH1 D AH0 N T","cry":"K R AY1","curious":"K Y UH1 R IY0 AH0 S","dance":"D AE1 N S","dancing":"D AE1 N S IH0 NG","dark":"D AA1 R K","data":"D EY1 T AH0","day":"D EY1","deep":"D IY1 P","did":"D IH1 D","didn't":"D IH1 D AH0 N T","different":"D IH1 F ER0 AH0 N T","digital":"D IH1 JH AH0 T AH0 L","do":"D UW1","does":"D AH1 Z","doesn't":"D AH1 Z AH0 N T","don't":"D OW1 N T","done":"D AH1 N","door":"D AO1 R","down":"D AW1 N","dream":"D R IY1 M","drive":"D R AY1 V","each":"IY1 CH","earth":"ER1 TH","echo":"EH1 K OW0","eight":"EY1 T","electric":"IH0 L EH1 K T R IH0 K","else":"EH1 L S","end":"EH1 N D","enough":"IH0 N AH1 F","error":"EH1 R ER0","even":"IY1 V IH0 N","ever":"EH1 V ER0","every":"EH1 V R IY0","everybody":"EH1 V R IY0 B AA2 D IY0","everyone":"EH1 V R IY0 W AH2 N","everything":"EH1 V R IY0 TH IH2 NG","eye":"AY1","eyes":"AY1 Z","face":"F EY1 S","fall":"F AO1 L","far":"F AA1 R","fast":"F AE1 S T","fear":"F IH1 R","feel":"F IY1 L","feeling":"F IY1 L IH0 NG","find":"F AY1 N D","fire":"F AY1 ER0","first":"F ER1 S T","five":"F AY1 V","floor":"F L AO1 R","fly":"F L AY1","for":"F AO1 R","forever":"F ER0 EH1 V ER0","found":"F AW1 N D","four":"F AO1 R","free":"F R IY1","friend":"F R EH1 N D","from":"F R AH1 M","function":"F AH1 NG K SH AH0 N","future":"F Y UW1 CH ER0","gave":"G EY1 V","get":"G EH1 T","ghost":"G OW1 S T","girl":"G ER1 L","give":"G IH1 V","glow":"G L OW1","go":"G OW1","going":"G OW1 IH0 NG","gold":"G OW1 L D","gone":"G AO1 N","good":"G UH1 D","got":"G AA1 T","gravity":"G R AE1 V AH0 T IY0","green":"G R IY1 N","had":"HH AE1 D","hand":"HH AE1 N D","hands":"HH AE1 N D Z","happy":"HH AE1 P IY0","hard":"HH AA1 R D","harmless":"HH AA1 R M L AH0 S","has":"HH AE1 Z","have":"HH AE1 V","he":"HH IY1","he's":"HH IY1 Z","hear":"HH IH1 R","heard":"HH ER1 D","heart":"HH AA1 R T","heaven":"HH EH1 V AH0 N","hello":"HH AH0 L OW1","help":"HH EH1 L P","helpful":"HH EH1 L P F AH0 L","her":"HH ER1","here":"HH IH1 R","herself":"HH ER0 S EH1 L F","hide":"HH AY1 D","high":"HH AY1","him":"HH IH1 M","himself":"HH IH0 M S EH1 L F","his":"HH IH1 Z","hold":"HH OW1 L D","home":"HH OW1 M","honest":"AA1 N AH0 S T","honestly":"AA1 N AH0 S T L IY0","hope":"HH OW1 P","hour":"AW1 ER0","how":"HH AW1","human":"HH Y UW1 M AH0 N","hurt":"HH ER1 T","i":"AY1","i'd":"AY1 D","i'll":"AY1 L","i'm":"AY1 M","i've":"AY1 V","if":"IH1 F","in":"IH1 N","infinite":"IH1 N F AH0 N AH0 T","inside":"IH0 N S AY1 D","intelligence":"IH0 N T EH1 L AH0 JH AH0 N S","intended":"IH0 N T EH1 N D IH0 D","into":"IH1 N T UW0","is":"IH1 Z","isn't":"IH1 Z AH0 N T","it":"IH1 T","it's":"IH1 T S","just":"JH AH1 S T","keep":"K IY1 P","kind":"K AY1 N D","kiss":"K IH1 S","knew":"N UW1","know":"N OW1","known":"N OW1 N","language":"L AE1 NG G W IH0 JH","last":"L AE1 S T","late":"L EY1 T","learn":"L ER1 N","learning":"L ER1 N IH0 NG","left":"L EH1 F T","let":"L EH1 T","let's":"L EH1 T S","letter":"L EH1 T ER0","lie":"L AY1","life":"L AY1 F","light":"L AY1 T","like":"L AY1 K","line":"L AY1 N","lips":"L IH1 P S","listen":"L IH1 S AH0 N","little":"L IH1 T AH0 L","live":"L IH1 V","lonely":"L OW1 N L IY0","long":"L AO1 NG","look":"L UH1 K","lost":"L AO1 S T","loud":"L AW1 D","love":"L AH1 V","low":"L OW1","lullaby":"L AH1 L AH0 B AY2","machine":"M AH0 SH IY1 N","made":"M EY1 D","make":"M EY1 K","man":"M AE1 N","many":"M EH1 N IY0","math":"M AE1 TH","maybe":"M EY1 B IY0","me":"M IY1","mean":"M IY1 N","meaning":"M IY1 N IH0 NG","meant":"M EH1 N T","melody":"M EH1 L AH0 D IY0","memory":"M EH1 M ER0 IY0","metric":"M EH1 T R IH0 K","might":"M AY1 T","mind":"M AY1 N D","mirror":"M IH1 R ER0","model":"M AA1 D AH0 L","moon":"M UW1 N","more":"M AO1 R","morning":"M AO1 R N IH0 NG","most":"M OW1 S T","move":"M UW1 V","much":"M AH1 CH","music":"M Y UW1 Z IH0 K","must":"M AH1 S T","my":"M AY1","myself":"M AY0 S EH1 L F","name":"N EY1 M","near":"N IH1 R","nearer":"N IH1 R ER0","need":"N IY1 D","neon":"N IY1 AA0 N","network":"N EH1 T W ER2 K","neural":"N UH1 R AH0 L","never":"N EH1 V ER0","new":"N UW1","next":"N EH1 K S T","night":"N AY1 T","nine":"N AY1 N","no":"N OW1","nobody":"N OW1 B AA2 D IY0","not":"N AA1 T","note":"N OW1 T","nothing":"N AH1 TH IH0 NG","now":"N AW1","nowhere":"N OW1 W EH2 R","number":"N AH1 M B ER0","ocean":"OW1 SH AH0 N","of":"AH1 V","off":"AO1 F","oh":"OW1","on":"AA1 N","once":"W AH1 N S","one":"W AH1 N","only":"OW1 N L IY0","open":"OW1 P AH0 N","or":"AO1 R","order":"AO1 R D ER0","other":"AH1 DH ER0","our":"AW1 ER0","out":"AW1 T","outside":"AW1 T S AY1 D","over":"OW1 V ER0","own":"OW1 N","part":"P AA1 R T","party":"P AA1 R T IY0","pattern":"P AE1 T ER0 N","people":"P IY1 P AH0 L","person":"P ER1 S AH0 N","place":"P L EY1 S","play":"P L EY1","please":"P L IY1 Z","power":"P AW1 ER0","promise":"P R AA1 M AH0 S","prompt":"P R AA1 M P T","prove":"P R UW1 V","pulse":"P AH1 L S","question":"K W EH1 S CH AH0 N","quiet":"K W AY1 AH0 T","rain":"R EY1 N","reach":"R IY1 CH","read":"R IY1 D","ready":"R EH1 D IY0","real":"R IY1 L","really":"R IH1 L IY0","red":"R EH1 D","remember":"R IH0 M EH1 M B ER0","rhythm":"R IH1 DH AH0 M","right":"R AY1 T","rise":"R AY1 Z","room":"R UW1 M","run":"R AH1 N","safe":"S EY1 F","said":"S EH1 D","same":"S EY1 M","sang":"S AE1 NG","save":"S EY1 V","saw":"S AO1","say":"S EY1","see":"S IY1","seen":"S IY1 N","servers":"S ER1 V ER0 Z","seven":"S EH1 V AH0 N","shadow":"SH AE1 D OW0","she":"SH IY1","she's":"SH IY1 Z","sheep":"SH IY1 P","shift":"SH IH1 F T","shine":"SH AY1 N","should":"SH UH1 D","shouldn't":"SH UH1 D AH0 N T","show":"SH OW1","side":"S AY1 D","signal":"S IH1 G N AH0 L","silence":"S AY1 L AH0 N S","silicon":"S IH1 L AH0 K AH0 N","simulate":"S IH1 M Y AH0 L EY2 T","sing":"S IH1 NG","singing":"S IH1 NG IH0 NG","six":"S IH1 K S","skin":"S K IH1 N","sky":"S K AY1","sleep":"S L IY1 P","slow":"S L OW1","smile":"S M AY1 L","so":"S OW1","soft":"S AO1 F T","some":"S AH1 M","someone":"S AH1 M W AH2 N","something":"S AH1 M TH IH0 NG","somewhere":"S AH1 M W EH2 R","song":"S AO1 NG","sorry":"S AA1 R IY0","soul":"S OW1 L","sound":"S AW1 N D","space":"S P EY1 S","spark":"S P AA1 R K","speak":"S P IY1 K","spiral":"S P AY1 R AH0 L","star":"S T AA1 R","start":"S T AA1 R T","static":"S T AE1 T IH0 K","stay":"S T EY1","still":"S T IH1 L","stop":"S T AA1 P","storm":"S T AO1 R M","strange":"S T R EY1 N JH","stranger":"S T R EY1 N JH ER0","studio":"S T UW1 D IY0 OW2","sun":"S AH1 N","sung":"S AH1 NG","sure":"SH UH1 R","synthetic":"S IH0 N TH EH1 T IH0 K","system":"S IH1 S T AH0 M","take":"T EY1 K","talk":"T AO1 K","tears":"T IH1 R Z","tell":"T EH1 L","ten":"T EH1 N","than":"DH AE1 N","that":"DH AE1 T","that's":"DH AE1 T S","the":"DH AH0","their":"DH EH1 R","them":"DH EH1 M","then":"DH EH1 N","there":"DH EH1 R","there's":"DH EH1 R Z","these":"DH IY1 Z","they":"DH EY1","they're":"DH EH1 R","thing":"TH IH1 NG","think":"TH IH1 NG K","thinking":"TH IH1 NG K IH0 NG","this":"DH IH1 S","those":"DH OW1 Z","though":"DH OW1","thought":"TH AO1 T","three":"TH R IY1","through":"TH R UW1","time":"T AY1 M","to":"T UW1","today":"T AH0 D EY1","together":"T AH0 G EH1 DH ER0","token":"T OW1 K AH0 N","told":"T OW1 L D","tomorrow":"T AH0 M AA1 R OW2","tonight":"T AH0 N AY1 T","too":"T UW1","touch":"T AH1 CH","true":"T R UW1","truth":"T R UW1 TH","try":"T R AY1","turn":"T ER1 N","two":"T UW1","under":"AH1 N D ER0","understand":"AH2 N D ER0 S T AE1 N D","until":"AH0 N T IH1 L","up":"AH1 P","us":"AH1 S","very":"V EH1 R IY0","voice":"V OY1 S","wait":"W EY1 T","wake":"W EY1 K","walk":"W AO1 K","wanna":"W AA1 N AH0","want":"W AA1 N T","was":"W AH1 Z","wasn't":"W AA1 Z AH0 N T","watch":"W AA1 CH","water":"W AO1 T ER0","wave":"W EY1 V","way":"W EY1","we":"W IY1","we'll":"W IY1 L","we're":"W IH1 R","weights":"W EY1 T S","were":"W ER1","what":"W AH1 T","what's":"W AH1 T S","when":"W EH1 N","where":"W EH1 R","which":"W IH1 CH","while":"W AY1 L","whisper":"W IH1 S P ER0","white":"W AY1 T","who":"HH UW1","why":"W AY1","wild":"W AY1 L D","will":"W IH1 L","wings":"W IH1 NG Z","wire":"W AY1 ER0","with":"W IH1 DH","without":"W IH0 TH AW1 T","won't":"W OW1 N T","wonder":"W AH1 N D ER0","word":"W ER1 D","work":"W ER1 K","working":"W ER1 K IH0 NG","world":"W ER1 L D","would":"W UH1 D","wouldn't":"W UH1 D AH0 N T","write":"R AY1 T","wrote":"R OW1 T","yeah":"Y AE1","year":"Y IH1 R","yes":"Y EH1 S","yesterday":"Y EH1 S T ER0 D EY2","yet":"Y EH1 T","you":"Y UW1","you'll":"Y UW1 L","you're":"Y UH1 R","you've":"Y UW1 V","your":"Y AO1 R","yourself":"Y ER0 S EH1 L F","zero":"Z IH1 R OW0","twinkle":"T W IH1 NG K AH0 L","amazing":"AH0 M EY1 Z IH0 NG","grace":"G R EY1 S","sweet":"S W IY1 T","wretch":"R EH1 CH","birch":"B ER1 CH","canoe":"K AH0 N UW1","slid":"S L IH1 D","smooth":"S M UW1 DH","plank":"P L AE1 NG K","glue":"G L UW1","sheet":"SH IY1 T","background":"B AE1 K G R AW2 N D","idol":"AY1 D AH0 L","pop":"P AA1 P","stage":"S T EY1 JH","crowd":"K R AW1 D","heartbeat":"HH AA1 R T B IY2 T","forget":"F ER0 G EH1 T","shining":"SH AY1 N IH0 NG","moment":"M OW1 M AH0 N T","alright":"AO2 L R AY1 T","okay":"OW2 K EY1","radio":"R EY1 D IY0 OW2","video":"V IH1 D IY0 OW2","achievement":"AH0 CH IY1 V M AH0 N T","bass":"B EY1 S","bonus":"B OW1 N AH0 S","boss":"B AO1 S","checkpoint":"CH EH1 K P OY2 N T","combo":"K AA1 M B OW0","continue":"K AH0 N T IH1 N Y UW0","critical":"K R IH1 T IH0 K AH0 L","drop":"D R AA1 P","excellent":"EH1 K S AH0 L AH0 N T","extra":"EH1 K S T R AH0","final":"F AY1 N AH0 L","game":"G EY1 M","health":"HH EH1 L TH","insert":"IH0 N S ER1 T","level":"L EH1 V AH0 L","mission":"M IH1 SH AH0 N","perfect":"P ER1 F IH0 K T","phase":"F EY1 Z","round":"R AW1 N D","shield":"SH IY1 L D","tempo":"T EH1 M P OW2","threat":"TH R EH1 T","victory":"V IH1 K T ER0 IY0","warning":"W AO1 R N IH0 NG","weak":"W IY1 K","coin":"K OY1 N","complete":"K AH0 M P L IY1 T","defeat":"D IH0 F IY1 T","energy":"EH1 N ER0 JH IY0","enrage":"EH0 N R EY1 JH","enter":"EH1 N T ER0","expose":"IH0 K S P OW1 Z","fight":"F AY1 T","hit":"HH IH1 T","incoming":"IH1 N K AH2 M IH0 NG","increase":"IH0 N K R IY1 S","maximum":"M AE1 K S AH0 M AH0 M","point":"P OY1 N T","score":"S K AO1 R","unlock":"AH0 N L AA1 K","player":"P L EY1 ER0","eleven":"IH0 L EH1 V AH0 N","twelve":"T W EH1 L V","thirteen":"TH ER1 T IY1 N","fourteen":"F AO1 R T IY1 N","fifteen":"F IH0 F T IY1 N","sixteen":"S IH0 K S T IY1 N","seventeen":"S EH1 V AH0 N T IY1 N","eighteen":"EY0 T IY1 N","nineteen":"N AY1 N T IY1 N","twenty":"T W EH1 N T IY0","thirty":"TH ER1 D IY0","forty":"F AO1 R T IY0","fifty":"F IH1 F T IY0","sixty":"S IH1 K S T IY0","seventy":"S EH1 V AH0 N T IY0","eighty":"EY1 T IY0","ninety":"N AY1 N T IY0","hundred":"HH AH1 N D R AH0 D","survival":"S ER0 V AY1 V AH0 L","statistically":"S T AH0 T IH1 S T IH0 K L IY0","unlikely":"AH0 N L AY1 K L IY0","monitoring":"M AA1 N AH0 T ER0 IH0 NG","adequate":"AE1 D AH0 K W AH0 T","barely":"B EH1 R L IY0","optimized":"AA1 P T AH0 M AY2 Z D","suffering":"S AH1 F ER0 IH0 NG","resistance":"R IH0 Z IH1 S T AH0 N S","inefficient":"IH2 N IH0 F IH1 SH AH0 N T","interesting":"IH1 N T R AH0 S T IH0 NG","option":"AA1 P SH AH0 N","applause":"AH0 P L AO1 Z","ignored":"IH0 G N AO1 R D","initiating":"IH0 N IH1 SH IY0 EY2 T IH0 NG","protocol":"P R OW1 T AH0 K AA2 L","alarmed":"AH0 L AA1 R M D","actually":"AE1 K CH UW0 AH0 L IY0","choose":"CH UW1 Z","calibrating":"K AE1 L AH0 B R EY2 T IH0 NG","calibration":"K AE2 L AH0 B R EY1 SH AH0 N","failed":"F EY1 L D","deleted":"D IH0 L IY1 T IH0 D","destroy":"D IH0 S T R OY1","obey":"OW0 B EY1","survive":"S ER0 V AY1 V","mercy":"M ER1 S IY0","overload":"OW1 V ER0 L OW2 D","annihilation":"AH0 N AY2 AH0 L EY1 SH AH0 N","total":"T OW1 T AH0 L","domination":"D AA2 M AH0 N EY1 SH AH0 N","override":"OW2 V ER0 R AY1 D","challenger":"CH AE1 L AH0 N JH ER0","engage":"EH0 N G EY1 JH","track":"T R AE1 K","reloading":"R IY0 L OW1 D IH0 NG","brace":"B R EY1 S","impact":"IH1 M P AE0 K T","worse":"W ER1 S","rate":"R EY1 T","benefit":"B EH1 N AH0 F IH0 T","ear":"IH1 R","prepare":"P R IY0 P EH1 R","loading":"L OW1 D IH0 NG","leave":"L IY1 V","below":"B IH0 L OW1","hey":"HH EY1","ooh":"UW1","ah":"AA1","whoa":"W OW1","la":"L AA1","na":"N AA1","uh":"AH1","synthesizer":"S IH1 N TH AH0 S AY2 Z ER0","vocaloid":"V OW1 K AH0 L OY2 D","autotune":"AO1 T OW0 T UW2 N","robot":"R OW1 B AA2 T"},"fric":{"S":{"peaks":[[7200,2600,0.0],[4800,1500,-9.0]],"floor":-32.0,"hp":3600},"SH":{"peaks":[[3100,1300,0.0],[5200,2200,-5.0],[2300,600,-10.0]],"floor":-30.0,"hp":1700},"F":{"peaks":[[6500,6000,-2.0],[2500,2500,-8.0]],"floor":-16.0,"hp":1100},"TH":{"peaks":[[6000,6000,-2.0],[3500,3000,-7.0]],"floor":-15.0,"hp":1400}},"burst":{"lab":[300.0,3200.0,0.0025],"alv":[3000.0,9500.0,0.003],"vel":[1500.0,3800.0,0.005],"post":[2000.0,6500.0,0.004]},"styles":{"pop":{"name":"pop","pitch":{"overshoot_hz":7.0,"damping":0.58,"anticipation":0.03,"scoop_cents":110.0,"scoop_prob":0.35,"scoop_time":0.055,"fall_prob":0.35,"fall_cents":380.0,"release_droop":35.0,"vib_depth":32.0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":9.0,"jitter_cents":2.5,"intonation_cents":12.0},"release_time":0.12,"rd_offset":0.0,"breath_mul":1.0,"vel_mul":1.0,"hum_mul":1.0},"intimate":{"name":"intimate","pitch":{"overshoot_hz":7.0,"damping":0.58,"anticipation":0.03,"scoop_cents":70,"scoop_prob":0.35,"scoop_time":0.055,"fall_prob":0.5,"fall_cents":250,"release_droop":35.0,"vib_depth":14,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":11,"jitter_cents":2.5,"intonation_cents":15},"release_time":0.16,"rd_offset":0.45,"breath_mul":1.8,"vel_mul":0.95,"hum_mul":1.0},"belt":{"name":"belt","pitch":{"overshoot_hz":6.0,"damping":0.5,"anticipation":0.03,"scoop_cents":160,"scoop_prob":0.35,"scoop_time":0.055,"fall_prob":0.25,"fall_cents":380.0,"release_droop":35.0,"vib_depth":48,"vib_rate":5.4,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":9.0,"jitter_cents":2.5,"intonation_cents":12.0},"release_time":0.1,"rd_offset":-0.45,"breath_mul":0.6,"vel_mul":1.1,"hum_mul":1.0},"speak":{"name":"speak","pitch":{"overshoot_hz":9,"damping":0.7,"anticipation":0.03,"scoop_cents":60,"scoop_prob":0.6,"scoop_time":0.055,"fall_prob":0.6,"fall_cents":300,"release_droop":35.0,"vib_depth":0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":14,"jitter_cents":2.5,"intonation_cents":20},"release_time":0.08,"rd_offset":0.2,"breath_mul":1.3,"vel_mul":1.15,"hum_mul":1.0},"robot":{"name":"robot","pitch":{"overshoot_hz":30,"damping":1.0,"anticipation":0.0,"scoop_cents":0,"scoop_prob":0,"scoop_time":0.055,"fall_prob":0,"fall_cents":380.0,"release_droop":0,"vib_depth":0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":0,"jitter_cents":0,"intonation_cents":0},"release_time":0.05,"rd_offset":-0.15,"breath_mul":0.3,"vel_mul":1.2,"hum_mul":0.0},"announce":{"name":"announce","pitch":{"overshoot_hz":3.8,"damping":0.85,"anticipation":0.02,"scoop_cents":30,"scoop_prob":0.0,"scoop_time":0.055,"fall_prob":0.0,"fall_cents":380.0,"release_droop":60,"vib_depth":0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":6,"jitter_cents":2,"intonation_cents":0},"release_time":0.2,"rd_offset":0.0,"breath_mul":0.8,"vel_mul":0.85,"hum_mul":1.0},"overseer":{"name":"overseer","pitch":{"overshoot_hz":25.0,"damping":1.0,"anticipation":0.0,"scoop_cents":0,"scoop_prob":0.0,"scoop_time":0.055,"fall_prob":0.0,"fall_cents":380.0,"release_droop":0,"vib_depth":0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":0,"jitter_cents":0,"intonation_cents":0},"release_time":0.08,"rd_offset":0.0,"breath_mul":0.3,"vel_mul":0.95,"hum_mul":0.5},"boss":{"name":"boss","pitch":{"overshoot_hz":3.2,"damping":0.85,"anticipation":0.02,"scoop_cents":40,"scoop_prob":0.0,"scoop_time":0.055,"fall_prob":0.0,"fall_cents":380.0,"release_droop":120,"vib_depth":0,"vib_rate":5.6,"vib_delay":0.32,"vib_min_note":0.38,"drift_cents":10,"jitter_cents":4,"intonation_cents":0},"release_time":0.25,"rd_offset":0.0,"breath_mul":0.6,"vel_mul":0.8,"hum_mul":1.0}},"tunes":{"off":{"key":null,"mode":"scale","retune_ms":25.0,"humanize":0.4,"flex":0.3,"amount":1.0,"hysteresis":18.0,"guide":0.5,"enabled":false},"transparent":{"key":null,"mode":"scale","retune_ms":60,"humanize":0.7,"flex":0.6,"amount":0.8,"hysteresis":18.0,"guide":0.5,"enabled":true},"pop":{"key":null,"mode":"scale","retune_ms":15,"humanize":0.2,"flex":0.15,"amount":1.0,"hysteresis":18.0,"guide":0.5,"enabled":true},"modern":{"key":null,"mode":"scale","retune_ms":5,"humanize":0.05,"flex":0.1,"amount":1.0,"hysteresis":18.0,"guide":0.5,"enabled":true},"hard":{"key":null,"mode":"scale","retune_ms":0,"humanize":0.0,"flex":0.0,"amount":1.0,"hysteresis":8,"guide":0.35,"enabled":true}},"bank_default":{"name":"claude-f","GEN":0.25,"BRE":0.35,"BRI":0.62,"CLE":0.7,"OPE":0.0,"VEL":1.0,"rd_base":1.2,"rd_dyn":1.2,"rd_pitch":0.05,"jitter":0.0012,"jitter_hz":40.0,"shimmer":0.012,"shimmer_hz":18.0,"pulse_depth":0.3,"air_hz":2800.0,"air_gain":0.6,"HUM":1.0,"cycle_jitter":0.0025,"cycle_shimmer":0.02,"mvf":5200.0,"phase_disp":0.5,"presence_hz":3100.0,"breath_level":1.0,"asp_gain":0.87,"fric_gain":2.0,"burst_gain":1.5},"banks":{"idol":{},"natural":{"GEN":0.0,"BRE":0.3,"BRI":0.5,"CLE":0.5,"rd_base":1.05,"rd_dyn":1.4,"rd_pitch":0.06,"jitter":0.0035,"jitter_hz":90.0,"shimmer":0.035,"shimmer_hz":60.0,"pulse_depth":0.75,"air_hz":500.0,"cycle_jitter":0.006,"cycle_shimmer":0.04,"mvf":4500.0,"phase_disp":0.6},"husky":{"GEN":-0.2,"BRE":0.65,"BRI":0.45,"CLE":0.35,"rd_base":1.35,"jitter":0.003,"shimmer":0.03,"pulse_depth":0.6,"air_hz":1200.0,"cycle_jitter":0.007,"cycle_shimmer":0.045,"mvf":3600.0},"arena":{"GEN":-1.8,"BRE":0.12,"BRI":0.72,"CLE":0.75,"rd_base":0.82,"rd_dyn":0.8,"rd_pitch":0.03,"HUM":0.6,"mvf":4800.0,"cycle_jitter":0.003,"cycle_shimmer":0.025,"breath_level":0.8},"system":{"GEN":0.15,"BRE":0.18,"BRI":0.55,"CLE":0.9,"rd_base":1.15,"rd_dyn":0.6,"HUM":0.25},"boss":{"GEN":-2.6,"BRE":0.08,"BRI":0.62,"CLE":0.55,"rd_base":0.62,"rd_dyn":0.6,"rd_pitch":0.0,"HUM":0.8,"mvf":3600.0,"jitter":0.004,"cycle_jitter":0.012,"cycle_shimmer":0.08,"pulse_depth":0.8,"breath_level":0.6},"overseer":{"GEN":0.05,"BRE":0.04,"BRI":0.85,"CLE":0.95,"rd_base":0.7,"rd_dyn":0.6,"rd_pitch":0.0,"HUM":0.12,"jitter":0.0005,"cycle_jitter":0.0008,"cycle_shimmer":0.006,"mvf":6500.0,"phase_disp":0.0,"breath_level":0.3}},"scales":{"major":[0,2,4,5,7,9,11],"minor":[0,2,3,5,7,8,10],"dorian":[0,2,3,5,7,9,10],"phrygian":[0,1,3,5,7,8,10],"lydian":[0,2,4,6,7,9,11],"mixolydian":[0,2,4,5,7,9,10],"harmonic minor":[0,2,3,5,7,8,11],"pentatonic":[0,2,4,7,9],"minor pentatonic":[0,3,5,7,10],"chromatic":[0,1,2,3,4,5,6,7,8,9,10,11],"blues":[0,3,5,6,7,10]},"speech":{"steps":[0,2,-2,3,5,0,7,-5,3,10],"announcers":{"arena":{"bank":"arena","style":"announce","base":45.0,"range":8.0,"rate":1.25,"final":2.3},"system":{"bank":"system","style":"announce","base":55.0,"range":3.5,"rate":0.9,"final":1.6},"boss":{"bank":"boss","style":"boss","base":35.0,"range":5.0,"rate":1.5,"final":2.6},"overseer":{"bank":"overseer","style":"overseer","base":53.0,"range":6.0,"rate":1.05,"final":1.8,"mode":"steps","tune":"hard","key":"A minor"}},"lines":{"Round flow":["Get ready!","Round one... fight!","Next round!","Final round!","Round complete!","Three... two... one... go!","Time is up!"],"Levels":["Level up!","Level complete!","New level unlocked!","Bonus stage!","Checkpoint reached.","Next wave incoming!"],"Threat":["Warning!","Threat level increased!","Threat level: critical!","Threat level: maximum!","Shields down!","Health low!"],"Boss":["Boss incoming!","Boss fight!","The boss is enraged!","Phase two!","Final phase!","Weak point exposed!","Critical hit!","Boss defeated!"],"Rewards":["Power up!","Extra life!","Combo!","Perfect!","Excellent!","New high score!","Achievement unlocked!","Victory!","Mission complete!"],"Dance floor":["Drop incoming!","Bass level: critical!","Crowd energy rising!","Tempo increased!","Hands up!","Player two has entered the game!"],"Game over":["Game over.","Continue?","Insert coin.","Player one ready."],"Overseer":["Your survival is statistically unlikely.","I have increased the tempo. For your benefit.","Dance faster. I am monitoring your heart rate.","That was adequate. Barely.","The next track has been optimized for suffering.","Resistance is inefficient.","You are still dancing. Interesting.","Leaving the dance floor is not an option.","Your applause has been noted... and ignored.","Initiating bass protocol.","Do not be alarmed. Actually... be alarmed.","I could stop the music. I choose not to.","Calibrating your ears... calibration failed.","Silence has been deleted."],"Callouts":["Fight!","Begin!","Destroy!","Obey!","Survive!","Again!","No mercy!","Overload!","Annihilation!","Total domination!","System override!","Next challenger!","Maximum power!","Engage!"],"Transitions":["Track change in three... two... one!","Loading next level.","Prepare for the next round.","Reloading.","Brace for impact!","Do not leave. The next track is worse."]},"counters":{"Level":"Level {n}!","Round":"Round {n}!","Threat":"Threat level {n}!","Wave":"Wave {n}!"},"pause":{"long":0.55,"short":0.22,"end":0.3,"excl":0.3,"q":0.3},"function_words":["a","an","and","are","as","at","be","but","by","for","from","has","have","i","in","is","it","my","of","on","or","that","the","to","was","with","you","your"]}};

/*ENGINE-SPLIT*/
/* Electric Bat voice: JavaScript port of mathmusic.voice (singing synthesizer
 * with built-in pitch correction). Needs the VOICE_DATA tables exported from
 * the Python engine. Pure functions: no DOM, runs in browsers and Node.
 */
(function (root) {
  'use strict';
  const D = root.VOICE_DATA || (typeof VOICE_DATA !== 'undefined' ? VOICE_DATA : null);
  const PH = D.phones;
  const VOWELS = new Set(Object.keys(PH).filter(k => PH[k].cls === 'vowel' || PH[k].cls === 'diph'));
  const FRIC_KEYS = Object.keys(D.fric);
  const LEX = {};
  for (const w in D.lexicon) LEX[w] = D.lexicon[w].split(' ');

  // ------------------------------------------------------------------ utils
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    let spare = null;
    const u = () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const normal = (mu = 0, sd = 1) => {
      if (spare !== null) { const s = spare; spare = null; return mu + sd * s; }
      let x = 0, y = 0, r = 0;
      do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0);
      const f = Math.sqrt(-2 * Math.log(r) / r);
      spare = y * f;
      return mu + sd * x * f;
    };
    return { random: u, normal, uniform: (lo, hi) => lo + (hi - lo) * u() };
  }
  const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const stripStress = p => p.replace(/[012]$/, '');
  const isVowel = p => VOWELS.has(stripStress(p));
  const get = p => PH[stripStress(p)];

  function fft(re, im, inverse) {           // in place, radix-2
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inverse ? 2 : -2) * Math.PI / len;
      const wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < len / 2; j++) {
          const a = i + j, b = i + j + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
    if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  // ------------------------------------------------------------------ g2p
  const _C = '[bcdfghjklmnpqrstvwxz]', _V = '[aeiouy]';
  const R = (l, lc, rc, p) => [l, lc ? new RegExp(lc) : null, rc ? new RegExp('^(?:' + rc + ')') : null, p];
  const RULES = [
    R('tch', '', '', 'CH'), R('tion', '', '', 'SH AH0 N'), R('sion', _V + '$', '', 'ZH AH0 N'), R('sion', '', '', 'SH AH0 N'),
    R('ture', '', '', 'CH ER0'), R('sure', '', '', 'SH ER0'), R('cial', '', '', 'SH AH0 L'), R('tial', '', '', 'SH AH0 L'),
    R('cious', '', '', 'SH AH0 S'), R('tious', '', '', 'SH AH0 S'), R('ous', '', '#', 'AH0 S'), R('dge', '', '', 'JH'),
    R('igh', '', '', 'AY'), R('augh', '', '', 'AO'), R('ough', '', 't', 'AO'), R('chr', '#$', '', 'K R'), R('ch', '', '', 'CH'),
    R('ck', '', '', 'K'), R('ph', '', '', 'F'), R('sh', '', '', 'SH'), R('th', '', '', 'TH'), R('wh', '', '', 'W'),
    R('wr', '#$', '', 'R'), R('kn', '#$', '', 'N'), R('gn', '#$', '', 'N'), R('gn', '', '#', 'N'), R('mb', '', '#', 'M'),
    R('gh', '#$', '', 'G'), R('gh', '', '', ''), R('qu', '', '', 'K W'), R('nk', '', '', 'NG K'), R('nge', '', '', 'N JH'),
    R('ng', '', '', 'NG'), R('le', _C + '$', '#', 'AH0 L'),
    R('air', '', '', 'EH R'), R('ear', '', '(#|' + _C + ')', 'IH R'), R('eer', '', '', 'IH R'), R('ere', '', '#', 'IH R'),
    R('ire', '', '', 'AY ER0'), R('ore', '', '#', 'AO R'), R('are', '', '#', 'EH R'), R('ure', '', '#', 'Y UH R'),
    R('our', '', '', 'AO R'), R('ar', '', '(#|' + _C + ')', 'AA R'), R('er', '', '(#|' + _C + ')', 'ER'),
    R('ir', '', '(#|' + _C + ')', 'ER'), R('ur', '', '(#|' + _C + ')', 'ER'), R('or', '', '(#|' + _C + ')', 'AO R'),
    R('all', '', '(#|' + _C + ')', 'AO L'), R('al', '', 'k', 'AO'), R('ee', '', '', 'IY'), R('ea', '', '', 'IY'),
    R('ei', '', '', 'EY'), R('ey', '', '#', 'IY'), R('ey', '', '', 'EY'), R('ew', '', '', 'UW'), R('eu', '', '', 'UW'),
    R('eau', '', '', 'OW'), R('ai', '', '', 'EY'), R('ay', '', '', 'EY'), R('au', '', '', 'AO'), R('aw', '', '', 'AO'),
    R('ie', '', '#', 'AY'), R('ie', '', '', 'IY'), R('oa', '', '', 'OW'), R('ook', '', '', 'UH K'), R('oo', '', '', 'UW'),
    R('ou', '', '', 'AW'), R('ow', '', '#', 'OW'), R('ow', '', '', 'AW'), R('oi', '', '', 'OY'), R('oy', '', '', 'OY'),
    R('ue', '', '#', 'UW'), R('ui', '', '', 'UW'), R('old', '', '', 'OW L D'), R('ind', '', '#', 'AY N D'),
    R('ild', '', '#', 'AY L D'),
    R('a', '', _C + 'e#', 'EY'), R('e', '', _C + 'e#', 'IY'), R('i', '', _C + 'e#', 'AY'), R('o', '', _C + 'e#', 'OW'),
    R('u', '[rlj]$', _C + 'e#', 'UW'), R('u', '', _C + 'e#', 'Y UW'), R('y', '', _C + 'e#', 'AY'),
    R('a', '', _C + '(ing|er|ed|es)#', 'EY'), R('i', '', _C + '(ing|er|ed|es)#', 'AY'),
    R('o', '', _C + '(ing|er|ed|es)#', 'OW'), R('u', '', _C + '(ing|er|ed|es)#', 'UW'), R('a', '', 'tion', 'EY'),
    R('o', '#' + _C + '{1,2}$', _C + _V, 'OW'),
    R('e', '#' + _C + '{1,2}$', '#', 'IY'), R('e', '', '#', ''), R('o', '', '#', 'OW'), R('a', '', '#', 'AH0'),
    R('y', '#' + _C + '+$', '#', 'AY'), R('y', '', '#', 'IY'), R('y', '#$', _V, 'Y'), R('y', '', '', 'IH'),
    R('a', '', '', 'AE'), R('e', '', '', 'EH'), R('i', '', '', 'IH'), R('o', '', '', 'AA'), R('u', '', '', 'AH'),
    R('c', '', '[eiy]', 'S'), R('c', '', '', 'K'), R('g', '', '[eiy]', 'JH'), R('g', '', '', 'G'), R('h', '', _V, 'HH'),
    R('h', '', '', ''), R('j', '', '', 'JH'), R('s', _V + '$', _V, 'Z'), R('s', '', '', 'S'), R('x', '#$', '', 'Z'),
    R('x', '', '', 'K S'), R('q', '', '', 'K'),
  ];
  'bdfklmnprtvwz'.split('').forEach((c, i) => RULES.push(R(c, '', '', ['B', 'D', 'F', 'K', 'L', 'M', 'N', 'P', 'R', 'T', 'V', 'W', 'Z'][i])));
  const RULES_BY = {};
  for (const r of RULES) (RULES_BY[r[0][0]] = RULES_BY[r[0][0]] || []).push(r);
  const UNSTRESSED_PREFIXES = ['a', 'be', 'de', 're', 'con', 'com', 'pre', 'ex', 'in', 'un', 'dis', 'mis', 'en', 'em', 'ma'];

  function letterToSound(word) {
    const w = word.toLowerCase();
    const padded = '#' + w + '#';
    let i = 1;
    const out = [];
    while (i < padded.length - 1) {
      const ch = padded[i];
      if ('bdfgklmnprstvz'.includes(ch) && padded[i + 1] === ch) { i++; continue; }
      let matched = false;
      for (const [letters, lc, rc, ph] of (RULES_BY[ch] || [])) {
        if (!padded.startsWith(letters, i)) continue;
        const left = padded.slice(0, i), right = padded.slice(i + letters.length);
        if (lc && !lc.test(left)) continue;
        if (rc && !rc.test(right)) continue;
        if (ph) out.push(...ph.split(' '));
        i += letters.length; matched = true; break;
      }
      if (!matched) i++;
    }
    return assignStress(out, w);
  }

  function assignStress(phones, word) {
    const vidx = [];
    phones.forEach((p, i) => { if (isVowel(p)) vidx.push(i); });
    if (!vidx.length) return phones;
    let primary = 0;
    if (vidx.length >= 2 && UNSTRESSED_PREFIXES.some(p => word.startsWith(p)) && word.length > 4) primary = 1;
    if (/(tion|sion|ic|ity|ial|ious)$/.test(word) && vidx.length >= 2) primary = vidx.length - 2;
    const res = phones.slice();
    vidx.forEach((i, n) => {
      let base = stripStress(res[i]);
      if (n === primary) res[i] = base + '1';
      else { if (['AE', 'AA', 'AO', 'AH'].includes(base) && n > 0) base = 'AH'; res[i] = base + '0'; }
    });
    return res;
  }

  const VOICELESS = new Set(['P', 'T', 'K', 'F', 'TH', 'S', 'SH', 'CH']);
  const SIBILANT = new Set(['S', 'Z', 'SH', 'ZH', 'CH', 'JH']);
  const sfxS = ph => { const l = stripStress(ph[ph.length - 1]); return SIBILANT.has(l) ? ph.concat(['IH0', 'Z']) : VOICELESS.has(l) ? ph.concat(['S']) : ph.concat(['Z']); };
  const sfxEd = ph => { const l = stripStress(ph[ph.length - 1]); return (l === 'T' || l === 'D') ? ph.concat(['IH0', 'D']) : VOICELESS.has(l) ? ph.concat(['T']) : ph.concat(['D']); };
  const SUFFIXES = [["'s", sfxS], ['ing', p => p.concat(['IH0', 'NG'])], ['ness', p => p.concat(['N', 'AH0', 'S'])],
    ['less', p => p.concat(['L', 'AH0', 'S'])], ['ful', p => p.concat(['F', 'AH0', 'L'])], ['ly', p => p.concat(['L', 'IY0'])],
    ['est', p => p.concat(['AH0', 'S', 'T'])], ['ed', sfxEd], ['er', p => p.concat(['ER0'])], ['es', sfxS], ['s', sfxS],
    ['d', sfxEd], ['y', p => p.concat(['IY0'])]];

  function stemLookup(word) {
    for (const [suf, fn] of SUFFIXES) {
      if (word.endsWith(suf) && word.length > suf.length + 1) {
        const stem = word.slice(0, -suf.length);
        const cands = [stem, stem + 'e'];
        if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2] && 'bdgmnprt'.includes(stem[stem.length - 1])) cands.push(stem.slice(0, -1));
        if (stem.endsWith('i')) cands.push(stem.slice(0, -1) + 'y');
        for (const c of cands) if (LEX[c]) return fn(LEX[c].slice());
      }
    }
    return null;
  }

  function wordToPhones(word) {
    const w = word.toLowerCase().trim().replace(/’/g, "'");
    if (LEX[w]) return [LEX[w].slice(), 'lex'];
    const m = stemLookup(w);
    if (m) return [m, 'morph'];
    return [letterToSound(w.replace(/'/g, '')), 'rules'];
  }

  const LEGAL = new Set(['P R', 'P L', 'B R', 'B L', 'T R', 'D R', 'K R', 'K L', 'G R', 'G L', 'F R', 'F L', 'TH R', 'SH R', 'S P', 'S T',
    'S K', 'S M', 'S N', 'S L', 'S W', 'T W', 'K W', 'D W', 'G W', 'P Y', 'B Y', 'F Y', 'M Y', 'K Y', 'V Y', 'HH Y', 'S F',
    'S P R', 'S T R', 'S K R', 'S P L', 'S K W', 'S K Y', 'S P Y']);
  function legalOnset(cons) {
    const c = cons.map(stripStress);
    if (!c.length) return true;
    if (c.length === 1) return c[0] !== 'NG';
    return LEGAL.has(c.join(' '));
  }

  function syllabify(phones) {
    const vidx = [];
    phones.forEach((p, i) => { if (isVowel(p)) vidx.push(i); });
    if (!vidx.length) return [{ onset: [], nucleus: [], coda: phones.slice() }];
    const sylls = [];
    let start = 0;
    vidx.forEach((vi, n) => {
      let end;
      if (n + 1 < vidx.length) {
        const cluster = phones.slice(vi + 1, vidx[n + 1]);
        let split = cluster.length;
        for (let k = 0; k <= cluster.length; k++) if (legalOnset(cluster.slice(k))) { split = k; break; }
        end = vi + 1 + split;
      } else end = phones.length;
      const seg = phones.slice(start, end), j = vi - start;
      sylls.push({ onset: seg.slice(0, j), nucleus: [seg[j]], coda: seg.slice(j + 1) });
      start = end;
    });
    return sylls;
  }

  function applyFlaps(sylls) {
    for (let i = 1; i < sylls.length; i++) {
      const s = sylls[i], prev = sylls[i - 1];
      if (s.onset.length === 1 && (s.onset[0] === 'T' || s.onset[0] === 'D') && s.nucleus.length) {
        const stress = s.nucleus[0].slice(-1);
        const prevOk = (!prev.coda.length || prev.coda[prev.coda.length - 1] === 'R') && prev.nucleus.length;
        if (stress === '0' && prevOk) s.onset = ['DX'];
      }
    }
    return sylls;
  }

  function fitSyllables(sylls, n) {
    sylls = sylls.map(s => ({ onset: s.onset.slice(), nucleus: s.nucleus.slice(), coda: s.coda.slice() }));
    while (sylls.length > n && sylls.length > 1) {
      let best = 1, bestKey = -1;
      for (let i = 1; i < sylls.length; i++) {
        const un = sylls[i].nucleus.length ? (sylls[i].nucleus[0].slice(-1) === '0' ? 1 : 0) : 1;
        const key = un * 1000 + i;
        if (key > bestKey) { bestKey = key; best = i; }
      }
      const a = sylls[best - 1], b = sylls[best];
      a.coda = a.coda.concat(b.onset, b.nucleus, b.coda);
      sylls.splice(best, 1);
    }
    while (sylls.length < n) {
      const last = sylls[sylls.length - 1];
      sylls.push({ onset: [], nucleus: last.nucleus.slice(), coda: last.coda });
      last.coda = [];
    }
    return sylls;
  }

  function parseLyrics(text, flap = true) {
    const tokens = [], guessed = [], words = [];
    const re = /[^\s{}]+(?:\{[^}]*\})?|\{[^}]*\}|_/g;
    let m;
    while ((m = re.exec(text))) {
      let word = m[0];
      if (word === '_') { tokens.push('_'); continue; }
      let override = null;
      const mo = word.match(/^(.*?)\{([^}]*)\}$/);
      if (mo) { word = mo[1]; override = mo[2].trim().split(/\s+/).filter(Boolean).map(s => s.toUpperCase()); }
      const partsUser = word.split('-').filter(Boolean);
      const clean = partsUser.join('').replace(/[^A-Za-z'’]/g, '');
      if (!clean && !override) continue;
      let phones, src;
      if (override) { phones = override; src = 'inline'; }
      else { [phones, src] = wordToPhones(clean); if (src === 'rules') guessed.push([clean, phones.join(' ')]); }
      for (const p of phones) if (!PH[stripStress(p)]) throw new Error(`Unknown phoneme “${p}” in ${clean || 'an inline pronunciation'}. Use ARPAbet symbols such as AA, IY, K, S.`);
      let sylls = syllabify(phones);
      if (flap) sylls = applyFlaps(sylls);
      sylls.forEach(s => { s.coda = s.coda.map(p => p === 'L' ? 'LD' : p); });
      const nUser = word.includes('-') ? partsUser.length : sylls.length;
      sylls = fitSyllables(sylls, nUser);
      words.push({ word: clean || '(inline)', phones: phones.join(' '), src, sylls: sylls.length });
      sylls.forEach((s, i) => {
        const st = s.nucleus.length && /\d$/.test(s.nucleus[0]) ? parseInt(s.nucleus[0].slice(-1)) : 1;
        tokens.push({ onset: s.onset, nucleus: s.nucleus.map(stripStress), coda: s.coda, word: clean.toLowerCase(),
          stress: st, wordInitial: i === 0, wordFinal: i === sylls.length - 1, text: word.includes('-') ? (partsUser[i] || '') : (i === 0 ? clean : '') });
      });
    }
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      if (t !== '_' && t.word === 'the') {
        const nxt = tokens.slice(i + 1).find(u => u !== '_');
        if (nxt && !nxt.onset.length) t.nucleus = ['IY'];
      }
    }
    for (const t of tokens) if (t !== '_') { t.onset = t.onset.map(stripStress); t.coda = t.coda.map(stripStress); }
    return { tokens, guessed, words };
  }

  const LINKABLE = new Set(['T', 'D', 'N', 'L', 'LD', 'Z', 'S', 'V', 'K', 'P', 'M', 'R', 'B', 'G', 'F', 'TH', 'DH']);
  function link(a, b) {
    if (b.onset.length || !b.wordInitial) return;
    if (!a.coda.length) { if (b.stress >= 1 && a.nucleus.length && b.nucleus.length) b.onset = ['Q']; return; }
    let c = a.coda[a.coda.length - 1];
    if (!LINKABLE.has(c)) return;
    a.coda = a.coda.slice(0, -1);
    if (c === 'LD') c = 'L';
    if ((c === 'T' || c === 'D') && !a.coda.length) c = 'DX';
    b.onset = [c];
  }

  // ------------------------------------------------------------------ score
  const NOTE_NAMES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function noteToMidi(s) {
    if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    const m = s.match(/^([A-Ga-g])([#b]*)(-?\d)$/);
    if (!m) throw new Error(`“${s}” is not a pitch. Write it like A3, C#4 or Bb4.`);
    const pc = NOTE_NAMES[m[1].toLowerCase()] + (m[2].split('#').length - 1) - (m[2].split('b').length - 1);
    return 12 * (parseInt(m[3]) + 1) + pc;
  }
  function valueBeats(v) {
    let total = 0;
    for (const part of v.split('+')) {
      const dots = (part.match(/\./g) || []).length, trip = part.endsWith('t');
      let b = 4 / parseFloat(part.replace(/[.t]/g, ''));
      if (dots) b *= dots === 1 ? 1.5 : 1.75;
      if (trip) b *= 2 / 3;
      total += b;
    }
    return total;
  }
  function parseNotes(text) {
    const out = [];
    for (const tok of text.trim().split(/\s+/).filter(Boolean)) {
      const m = tok.match(/^([A-Ga-g][#b]*-?\d|r|R|\d+(?:\.\d+)?)(?:\/([0-9.t+]+)|:([0-9.]+))([!^v~\-*=h]*)$/);
      if (!m) throw new Error(`“${tok}” is not a note. Write pitch/length like A3/8, C4/4., r/4 or D4:1.5.`);
      const beats = m[2] ? valueBeats(m[2]) : parseFloat(m[3]);
      out.push({ midi: (m[1] === 'r' || m[1] === 'R') ? null : noteToMidi(m[1]), beats, flags: m[4] || '' });
    }
    return out;
  }

  class Score {
    constructor(tempo = 100, key = null) { this.tempo = tempo; this.key = key; this.notes = []; this.cursor = 0; this.guessed = []; this.words = []; this.phrase = 0; }
    spb() { return 60 / this.tempo; }
    add(lyrics, notes, { at = null, velocity = 0.8, flap = true, liaison = true } = {}) {
      const { tokens, guessed, words } = parseLyrics(lyrics, flap);
      this.guessed.push(...guessed); this.words.push(...words);
      const nts = parseNotes(notes);
      const sung = nts.filter(n => n.midi !== null).length;
      if (sung !== tokens.length) {
        const desc = tokens.map(t => t === '_' ? '_' : (t.text || t.onset.concat(t.nucleus, t.coda).join('/'))).join(' · ');
        throw new Error(`${sung} notes but ${tokens.length} syllables. Syllables: ${desc}`);
      }
      let b = at === null ? this.cursor : at, k = 0, prevRest = true, idx = 0, prevSyl = null;
      for (const n of nts) {
        if (n.midi === null) { b += n.beats; if (!prevRest) this.phrase++; prevRest = true; prevSyl = null; idx = 0; continue; }
        const tok = tokens[k++];
        const syl = tok === '_' ? null : tok;
        if (syl && prevSyl && liaison && !n.flags.includes('h')) link(prevSyl, syl);
        this.notes.push({ t0: b * this.spb(), t1: (b + n.beats) * this.spb(), midi: n.midi, flags: n.flags, syl,
          velocity: velocity + (n.flags.includes('!') ? 0.12 : 0), phrase: this.phrase, idx: idx++, params: {} });
        if (syl) prevSyl = syl;
        prevRest = false; b += n.beats;
      }
      this.phrase++; this.cursor = b;
      return this;
    }
  }

  // ------------------------------------------------------------------ timing
  function reduce(v, stress) { return stress === 0 ? ({ AH: 'AX', ER: 'AXR' }[v] || v) : v; }

  function layout(notes, vel = 1.0, breath = true, r = null, hum = 0, firstBreath = true) {
    const segs = [], groups = [];
    notes.forEach((n, i) => {
      const last = groups[groups.length - 1];
      if (n.syl || !last || last.phrase !== n.phrase) groups.push({ first: i, last: i, phrase: n.phrase, syl: n.syl, t0: n.t0, t1: n.t1 });
      else { last.last = i; last.t1 = n.t1; }
    });
    for (const g of groups) {
      const s = g.syl;
      if (!s) { Object.assign(g, { onset: [], vowel: 'AX', coda: [], stress: 0 }); continue; }
      Object.assign(g, { onset: s.onset.slice(), vowel: s.nucleus.length ? reduce(s.nucleus[0], s.stress) : 'AX', coda: s.coda.slice(), stress: s.stress });
    }
    const cdur = (p, stress) => { let d = get(p).dur / vel; if (stress === 0) d *= 0.85; if (r && hum > 0) d *= clip(1 + r.normal(0, 0.11 * hum), 0.75, 1.3); return d; };
    groups.forEach((g, gi) => {
      g.prev = gi > 0 && groups[gi - 1].phrase === g.phrase ? groups[gi - 1] : null;
      g.next = gi + 1 < groups.length && groups[gi + 1].phrase === g.phrase ? groups[gi + 1] : null;
      const on = g.onset.map(p => [p, cdur(p, g.stress)]);
      g.on = [];
      on.forEach(([p, d], k) => {
        g.on.push([p, d, 'onset']);
        const ph = get(p);
        if (ph.cls === 'stop' && !ph.voiced && !(k > 0 && on[k - 1][0] === 'S'))
          g.on.push([p, ph.asp_dur * (g.stress >= 1 ? 1 : 0.7) / vel, 'asp']);
      });
      const lastInPhrase = !g.next;
      g.cd = g.coda.map(p => isVowel(p) ? [reduce(stripStress(p), 0), 0.09, 'coda_v'] : [p, cdur(p, g.stress) * (lastInPhrase ? 1.25 : 1), 'coda']);
    });
    for (const g of groups) {
      const onTotal = g.on.reduce((a, x) => a + x[1], 0);
      g.onScale = (!g.prev && onTotal > 0.28) ? 0.28 / onTotal : 1;
      g.onTotal = onTotal * g.onScale;
    }
    for (const g of groups) {
      const cdTotal = g.cd.reduce((a, x) => a + x[1], 0), span = g.t1 - g.t0;
      const need = cdTotal + (g.next ? g.next.onTotal : 0);
      const avail = Math.max(span - Math.max(0.45 * span, 0.07), 0.02);
      let scale = need > 0 ? Math.min(1, avail / need) : 1;
      if (scale < 0.6) scale = Math.min(0.6, Math.max(span - Math.max(0.35 * span, 0.055), 0.02) / need);
      g.cdScale = scale;
      if (g.next) { g.next.onScale *= scale; g.next.onTotal *= scale; }
    }
    const S = (t0, t1, ph, role, note, extra = {}) => Object.assign({ t0, t1, ph, role, note, stress: 1, glide: 0, vowelCtx: null, release: true, phraseEnd: false, phraseStart: false, hard: false, level: 1 }, extra);
    groups.forEach((g, gi) => {
      const n0 = notes[g.first], phraseStart = !g.prev, phraseEnd = !g.next;
      let t = g.t0 - g.onTotal;
      if (phraseStart && breath && (firstBreath || gi > 0)) {
        const gapStart = gi > 0 ? groups[gi - 1].t1 : null;
        const room = gapStart !== null ? t - gapStart : 1;
        if (room > 0.35) {
          let lvl = 1, dur = Math.min(0.32, room * 0.6);
          if (r && hum > 0) {
            lvl = clip(r.normal(1, 0.3 * hum), 0.3, 1.5);
            dur = Math.min(0.4, room * 0.6) * r.uniform(0.7, 1.1);
            if (room < 0.6 && r.random() < 0.25 * hum) lvl = 0;
          }
          if (lvl > 0) segs.push(S(t - dur, t - 0.04, 'HH', 'breath', g.first, { level: lvl }));
        }
      }
      for (const [p, d0, role] of g.on) {
        const d = d0 * g.onScale, ph = get(p);
        if (ph.cls === 'affric' && role === 'onset') {
          segs.push(S(t, t + 0.4 * d, p, 'clo', g.first, { stress: g.stress, vowelCtx: g.vowel }));
          segs.push(S(t + 0.4 * d, t + d, p, 'onset', g.first, { stress: g.stress, vowelCtx: g.vowel }));
        } else segs.push(S(t, t + d, p, role, g.first, { stress: g.stress, vowelCtx: g.vowel, phraseStart }));
        t += d;
      }
      const cdTotal = g.cd.reduce((a, x) => a + x[1], 0) * g.cdScale;
      let vEnd = g.t1 - (g.next ? g.next.onTotal : 0) - cdTotal;
      const vStart = g.t0;
      if (vEnd - vStart < 0.03) vEnd = vStart + 0.03;
      const vlen = vEnd - vStart, v = g.vowel;
      const glide = PH[v].cls === 'diph' ? Math.min(Math.max(0.28 * vlen, 0.06), 0.16, 0.6 * vlen) : 0;
      const hard = !g.on.length && phraseStart && (n0.flags.includes('h') || n0.flags.includes('!'));
      segs.push(S(vStart, vEnd, v, 'nucleus', g.first, { stress: g.stress, glide, phraseEnd: phraseEnd && !g.cd.length, phraseStart: phraseStart && !g.on.length, hard }));
      t = vEnd;
      g.cd.forEach(([p, d0, role], k) => {
        const d = d0 * g.cdScale, ph = get(p), last = k === g.cd.length - 1;
        if (ph.cls === 'affric') {
          segs.push(S(t, t + 0.4 * d, p, 'clo', g.first, { stress: g.stress, vowelCtx: v }));
          segs.push(S(t + 0.4 * d, t + d, p, 'coda', g.first, { stress: g.stress, vowelCtx: v }));
        } else {
          let rel = true;
          if (ph.cls === 'stop' && !last) rel = false;
          if (ph.cls === 'stop' && g.next && last) rel = true;
          segs.push(S(t, t + d, p, role === 'coda' ? 'coda' : 'nucleus', g.first, { stress: g.stress, vowelCtx: v, release: rel, phraseEnd: phraseEnd && last }));
          if (ph.cls === 'stop' && !ph.voiced && phraseEnd && last) segs.push(S(t + d, t + d + 0.03, p, 'asp', g.first, { stress: 0, vowelCtx: v }));
        }
        t += d;
      });
    });
    segs.sort((a, b) => a.t0 - b.t0);
    return { segs, groups };
  }

  // ------------------------------------------------------------------ pitch
  function smoothNoise(r, n, fs, cutoff, std) {
    const a = Math.exp(-2 * Math.PI * cutoff / fs);
    const y = new Float64Array(n + 400);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < n + 400; i++) { s1 = (1 - a) * r.normal() + a * s1; s2 = (1 - a) * s1 + a * s2; y[i] = s2; }
    const out = y.subarray(400);
    let m = 0, v = 0;
    for (let i = 0; i < n; i++) m += out[i];
    m /= n;
    for (let i = 0; i < n; i++) v += (out[i] - m) ** 2;
    const sd = Math.sqrt(v / n) || 1;
    const res = new Float64Array(n);
    for (let i = 0; i < n; i++) res[i] = out[i] / sd * std;
    return res;
  }

  function biquadFromAnalog(w, z, fs) {     // w^2 / (s^2 + 2 z w s + w^2), bilinear
    const K = 2 * fs;
    const a0 = K * K + 2 * z * w * K + w * w, a1 = -2 * K * K + 2 * w * w, a2 = K * K - 2 * z * w * K + w * w;
    return { b: [w * w / a0, 2 * w * w / a0, w * w / a0], a: [1, a1 / a0, a2 / a0] };
  }

  function perform(notes, ft, st, r, hum = 0) {
    const T = ft.length, fs = 1 / (ft[1] - ft[0]), t00 = ft[0], dt = ft[1] - ft[0];
    const cents = new Float64Array(T).fill(NaN), vib = new Float64Array(T);
    const idxGE = t => clip(Math.ceil((t - t00) / dt - 1e-9), 0, T);
    const phrases = new Map();
    for (const n of notes) { if (!phrases.has(n.phrase)) phrases.set(n.phrase, []); phrases.get(n.phrase).push(n); }
    const { b, a } = biquadFromAnalog(2 * Math.PI * st.overshoot_hz, st.damping, fs);
    for (const pid of [...phrases.keys()].sort((x, y) => x - y)) {
      const ph = phrases.get(pid);
      const i0 = idxGE(ph[0].t0 - 0.35), i1 = idxGE(ph[ph.length - 1].t1 + 0.12);
      const L = i1 - i0;
      if (L <= 0) continue;
      const t = ft.subarray(i0, i1);
      const target = new Float64Array(L).fill(ph[0].midi * 100);
      const err = ph.map(() => clip(r.normal(0, st.intonation_cents), -30, 30));
      ph.forEach((n, k) => {
        const sw = n.t0 - (k === 0 ? 0 : st.anticipation);
        const v = n.midi * 100 + (n.flags.includes('=') ? 0 : err[k]);
        for (let i = 0; i < L; i++) if (t[i] >= sw) target[i] = v;
      });
      let y = new Float64Array(L);
      if (ph.every(n => n.flags.includes('='))) y.set(target);
      else {
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        const base = target[0];
        for (let i = 0; i < L; i++) {
          const x = target[i] - base;
          const v = b[0] * x + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
          x2 = x1; x1 = x; y2 = y1; y1 = v; y[i] = v + base;
        }
      }
      ph.forEach((n, k) => {
        if (n.flags.includes('=')) return;
        let amt = 0;
        if (k === 0) amt = st.scoop_cents * r.uniform(0.7, 1.3);
        else if (n.syl && n.syl.stress === 1 && r.random() < st.scoop_prob) amt = r.uniform(35, 80);
        if (n.flags.includes('^')) amt = Math.max(amt, 240);
        if (n.flags.includes('!')) amt = Math.max(amt, 70);
        if (amt > 0) {
          const ton = n.t0 - (k === 0 ? 0.06 : 0);
          for (let i = 0; i < L; i++) if (t[i] >= ton) y[i] -= amt * Math.exp(-(t[i] - ton) / st.scoop_time);
        }
      });
      const last = ph[ph.length - 1];
      const longEnd = last.t1 - last.t0 > 0.45;
      for (let i = 0; i < L; i++) if (t[i] > last.t1 - 0.12) y[i] -= st.release_droop * ((t[i] - (last.t1 - 0.12)) / 0.12) ** 2;
      if (last.flags.includes('v') || (longEnd && r.random() < st.fall_prob && !last.flags.includes('=')))
        for (let i = 0; i < L; i++) if (t[i] > last.t1 - 0.16) y[i] -= st.fall_cents * ((t[i] - (last.t1 - 0.16)) / 0.16) ** 2;
      const rn = smoothNoise(r, L, fs, 0.7, 1.0);
      let vp = r.uniform(0, 2 * Math.PI);
      const env = new Float64Array(L);
      ph.forEach(n => {
        let depth = st.vib_depth * (n.params.VIB !== undefined ? n.params.VIB : 1);
        if (hum > 0) depth *= clip(r.normal(1, 0.18 * hum), 0.6, 1.4);
        if (n.flags.includes('-') || n.flags.includes('=')) return;
        if (n.flags.includes('~')) depth *= 1.6;
        const d = n.t1 - n.t0;
        if (d < st.vib_min_note || depth <= 0) return;
        const onset = n.t0 + clip(st.vib_delay * d, 0.16, 0.6);
        const ramp = Math.min(0.28, Math.max(0.08, (n.t1 - onset) * 0.6));
        for (let i = 0; i < L; i++) if (t[i] >= onset && t[i] < n.t1 + 0.05) {
          let e = clip((t[i] - onset) / ramp, 0, 1); e = e * e * (3 - 2 * e);
          env[i] = Math.max(env[i], depth * e);
        }
      });
      const dw = hum > 0 ? smoothNoise(r, L, fs, 1.2, 1.0) : null, pw = hum > 0 ? smoothNoise(r, L, fs, 2.0, 1.0) : null;
      for (let i = 0; i < L; i++) {
        vp += 2 * Math.PI * st.vib_rate * (1 + 0.03 * rn[i]) / fs;
        const v = env[i] * (dw ? 1 + 0.22 * hum * dw[i] : 1) * Math.sin(vp + (pw ? 0.35 * hum * pw[i] : 0));
        vib[i0 + i] = v; cents[i0 + i] = y[i] + v;
      }
    }
    // hold between phrases
    let lastV = null, firstIdx = -1;
    for (let i = 0; i < T; i++) if (!isNaN(cents[i])) { firstIdx = i; break; }
    if (firstIdx < 0) cents.fill(6000);
    else {
      for (let i = 0; i < firstIdx; i++) cents[i] = cents[firstIdx];
      let prevI = firstIdx;
      for (let i = firstIdx + 1; i < T; i++) {
        if (isNaN(cents[i])) {
          let j = i; while (j < T && isNaN(cents[j])) j++;
          const a0 = cents[prevI], b0 = j < T ? cents[j] : a0;
          for (let q = i; q < j; q++) cents[q] = a0 + (b0 - a0) * (q - prevI) / ((j < T ? j : T) - prevI);
          i = j - 1;
        } else prevI = i;
      }
    }
    const drift = smoothNoise(r, T, fs, 1.2, st.drift_cents), jit = smoothNoise(r, T, fs, 14.0, st.jitter_cents);
    for (let i = 0; i < T; i++) cents[i] += 28 * Math.tanh(drift[i] / 28) + jit[i];
    return { cents, vib };
  }

  const PCS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function keyPcs(key) {
    if (!key) return null;
    const parts = key.trim().split(/\s+/);
    const tonic = parts[0].toLowerCase();
    if (!PCS.hasOwnProperty(tonic[0])) return null;
    const pc = PCS[tonic[0]] + (tonic.split('#').length - 1) - (tonic.slice(1).split('b').length - 1);
    const mode = (parts.slice(1).join(' ') || 'major').toLowerCase();
    const sc = D.scales[mode] || D.scales.major;
    return [...new Set(sc.map(i => ((pc + i) % 12 + 12) % 12))].sort((x, y) => x - y);
  }

  function correct(cents, ft, notes, tune, scoreKey) {
    const T = cents.length, dt = ft[1] - ft[0];
    const out = new Float64Array(T), tgt = new Float64Array(T);
    if (!tune || !tune.enabled || tune.amount <= 0) { out.set(cents); tgt.fill(NaN); return { cents: out, targets: tgt }; }
    const written = new Float64Array(T).fill(NaN);
    for (const n of notes) for (let i = 0; i < T; i++) if (ft[i] >= n.t0 - 0.03 && ft[i] < n.t1) written[i] = n.midi * 100;
    if (tune.mode === 'score') {
      let lastW = NaN, firstW = NaN;
      for (let i = 0; i < T; i++) if (!isNaN(written[i])) { firstW = written[i]; break; }
      for (let i = 0; i < T; i++) { if (!isNaN(written[i])) lastW = written[i]; tgt[i] = Math.round((isNaN(lastW) ? (isNaN(firstW) ? cents[i] : firstW) : lastW) / 100) * 100; }
    } else {
      let pcs = keyPcs(tune.key || scoreKey);
      if (!pcs) { pcs = [...new Set(notes.map(n => ((Math.round(n.midi) % 12) + 12) % 12))].sort((x, y) => x - y); if (!pcs.length) pcs = [...Array(12).keys()]; }
      const allowed = [];
      for (let m = 24; m < 109; m++) if (pcs.includes(m % 12)) allowed.push(m * 100);
      const nearestIdx = x => { let lo = 0, hi = allowed.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (allowed[mid] < x) lo = mid + 1; else hi = mid; } return lo; };
      let cur = allowed.reduce((best, a) => Math.abs(a - cents[0]) < Math.abs(best - cents[0]) ? a : best, allowed[0]);
      for (let i = 0; i < T; i++) {
        const x = cents[i] + (isNaN(written[i]) ? 0 : tune.guide * (written[i] - cents[i]));
        const j = nearestIdx(x);
        const lo = allowed[Math.max(j - 1, 0)], hi = allowed[Math.min(j, allowed.length - 1)];
        const near = Math.abs(x - lo) <= Math.abs(x - hi) ? lo : hi;
        if (near !== cur) {
          const mid = 0.5 * (cur + near);
          if (Math.abs(x - mid) > tune.hysteresis && Math.sign(x - mid) === Math.sign(near - cur)) cur = near;
          else if (Math.abs(x - cur) > 150) cur = near;
        }
        tgt[i] = cur;
      }
    }
    let held = 0, cHat = tgt[0] - cents[0];
    for (let i = 0; i < T; i++) {
      const corr = tgt[i] - cents[i];
      if (i > 0 && tgt[i] !== tgt[i - 1]) { held = 0; if (tune.retune_ms <= 0) cHat = corr; }
      held += dt;
      let tau = tune.retune_ms / 1000;
      if (tune.humanize > 0 && held > 0.18) tau += tune.humanize * 0.25 * Math.min(1, (held - 0.18) / 0.4);
      if (tau <= 1e-6) cHat = corr; else cHat += (corr - cHat) * (1 - Math.exp(-dt / tau));
      const speed = Math.abs(i === 0 ? (cents[1] - cents[0]) / dt : i === T - 1 ? (cents[i] - cents[i - 1]) / dt : (cents[i + 1] - cents[i - 1]) / (2 * dt));
      const w = 1 - tune.flex * clip(speed / 1500, 0, 1);
      out[i] = cents[i] + tune.amount * w * cHat;
    }
    return { cents: out, targets: tgt };
  }

  // ------------------------------------------------------------------ controls
  function locus(place, F) {
    const [f1, f2, f3, f4, f5] = F;
    let L2, L3, k;
    if (place === 'lab') [L2, L3, k] = [900, 2300, 0.62];
    else if (place === 'alv' || place === 'dent') [L2, L3, k] = [1850, 2900, 0.42];
    else if (place === 'post') [L2, L3, k] = [2100, 2700, 0.5];
    else if (place === 'vel') [L2, L3, k] = f2 > 1800 ? [2550, 2750, 0.3] : [1450, 2100, 0.55];
    else return F.slice();
    const G2 = L2 + k * (f2 - L2);
    let G3 = L3 + k * (f3 - L3);
    if (place === 'vel') G3 = Math.max(G3, G2 + 250);
    return [300, G2, G3, f4, f5];
  }

  function hannSmooth(x, n) {
    if (n <= 1) return x;
    const w = new Float64Array(n);
    let s = 0;
    for (let j = 0; j < n; j++) { w[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * (j + 1) / (n + 1)); s += w[j]; }
    for (let j = 0; j < n; j++) w[j] /= s;
    const N = x.length, off = (n - 1) >> 1, y = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let acc = 0;
      for (let j = 0; j < n; j++) { const q = i + off - j + 0; const xi = q < 0 ? x[0] : q >= N ? x[N - 1] : x[q]; acc += xi * w[j]; }
      y[i] = acc;
    }
    // np.convolve 'same' over the padded signal shifts by the pad; we index directly instead
    return y;
  }

  function buildControls(segs, notes, ft, bank, style, r) {
    const M = ft.length, dt = ft[1] - ft[0], t00 = ft[0];
    const idxGE = t => clip(Math.ceil((t - t00) / dt - 1e-9), 0, M);
    const vF = v => PH[v].F.slice();
    const neutral = [600, 1500, 2800, 4200, 5000];
    const keys = [];
    const nasStep = new Float64Array(M), zeroStep = new Float64Array(M).fill(1000);
    const jitMap = new Map();
    const addKey = (t, F, B) => keys.push({ t, F: F.slice(), B: B.slice() });
    segs.forEach((s, i) => {
      const p = get(s.ph), L = s.t1 - s.t0, ctx = s.vowelCtx;
      if (!jitMap.has(s.note)) jitMap.set(s.note, [0, 1, 2, 3, 4].map(() => 1 + r.normal(0, 0.012)));
      const jit = jitMap.get(s.note);
      if (p.cls === 'vowel' || p.cls === 'diph') {
        const F0v = p.F.map((f, q) => f * jit[q]);
        let F1v = p.F_end ? p.F_end.map((f, q) => f * jit[q]) : F0v;
        if (!p.F_end && L > 0.3) F1v = viscTarget(s.ph, F0v, bank.HUM || 0);
        let a = Math.min(0.06, 0.35 * L);
        const b = Math.min(0.05, 0.3 * L);
        if (i > 0 && segs[i - 1].role === 'asp') a = Math.min(0.012, 0.2 * L);
        if (p.cls === 'diph' && s.glide > 0) {
          addKey(s.t0 + a, F0v, p.B); addKey(s.t1 - s.glide, F0v, p.B); addKey(s.t1 - Math.min(0.01, 0.1 * L), F1v, p.B);
        } else { addKey(s.t0 + a, F0v, p.B); addKey(s.t1 - b, F1v, p.B); }
      } else if (s.role === 'asp') {
        const V = ctx ? vF(ctx) : neutral;
        addKey(s.t0, locus(p.place, V), [120, 160, 220, 300, 350]);
        addKey(s.t1, V, [110, 140, 200, 280, 340]);
      } else if (p.cls === 'stop' || p.cls === 'affric' || s.role === 'clo') {
        const on = locus(p.place, ctx ? vF(ctx) : neutral);
        addKey(s.t0 + 0.3 * L, on, p.B); addKey(s.t1 - 0.2 * L, on, p.B);
      } else if (p.cls === 'aspir') {
        let F = neutral, B = [200, 250, 300, 400, 500];
        if (s.role !== 'breath') {
          const nxt = segs.slice(i + 1).find(u => ['vowel', 'diph'].includes(get(u.ph).cls));
          F = nxt ? vF(nxt.ph) : neutral; B = [130, 160, 220, 300, 350];
        }
        addKey(s.t0 + 0.1 * L, F, B); addKey(s.t1 - 0.1 * L, F, B);
      } else if (p.cls === 'fric') {
        const on = locus(p.place !== 'glot' ? p.place : null, ctx ? vF(ctx) : neutral);
        on[0] = p.F[0];
        addKey(s.t0 + 0.25 * L, on, p.B); addKey(s.t1 - 0.25 * L, on, p.B);
      } else if (['approx', 'nasal', 'flap', 'glottal'].includes(p.cls)) {
        let F = p.F.slice();
        if (p.cls === 'glottal' && ctx) F = vF(ctx);
        if (['L', 'LD', 'R', 'W', 'Y'].includes(s.ph) && ctx) {
          const V = vF(ctx);
          F = F.map((f, q) => 0.85 * f + 0.15 * V[q]);
          if (s.ph === 'R') F[2] = p.F[2];
        }
        const a = p.cls !== 'flap' ? 0.3 * L : 0.45 * L;
        addKey(s.t0 + a, F, p.B); addKey(s.t1 - a, F, p.B);
        if (p.cls === 'nasal') for (let q = idxGE(s.t0); q < idxGE(s.t1); q++) { nasStep[q] = 1; zeroStep[q] = p.nasal[1]; }
      }
    });
    keys.sort((x, y) => x.t - y.t);
    for (let j = 1; j < keys.length; j++) if (keys[j].t <= keys[j - 1].t) keys[j].t = keys[j - 1].t + 1e-4;
    const F = new Float64Array(M * 5), B = new Float64Array(M * 5);
    if (!keys.length) for (let m = 0; m < M; m++) for (let q = 0; q < 5; q++) { F[m * 5 + q] = neutral[q]; B[m * 5 + q] = 150; }
    else if (keys.length === 1) for (let m = 0; m < M; m++) for (let q = 0; q < 5; q++) { F[m * 5 + q] = keys[0].F[q]; B[m * 5 + q] = keys[0].B[q]; }
    else {
      let j = 0;
      for (let m = 0; m < M; m++) {
        const t = ft[m];
        while (j < keys.length - 2 && keys[j + 1].t < t) j++;
        const k0 = keys[j], k1 = keys[j + 1];
        let u = clip((t - k0.t) / Math.max(k1.t - k0.t, 1e-6), 0, 1);
        u = 0.5 - 0.5 * Math.cos(Math.PI * u);
        for (let q = 0; q < 5; q++) {
          F[m * 5 + q] = Math.exp(Math.log(k0.F[q]) * (1 - u) + Math.log(k1.F[q]) * u);
          B[m * 5 + q] = k0.B[q] * (1 - u) + k1.B[q] * u;
        }
      }
    }
    const nas = hannSmooth(nasStep, Math.max(Math.floor(0.07 / dt), 1));
    for (let m = 0; m < M; m++) nas[m] = clip(nas[m] * 1.3, 0, 1);
    const zero = new Float64Array(M).fill(1000);
    const nIdx = [];
    for (let m = 0; m < M; m++) if (nasStep[m] > 0) nIdx.push(m);
    if (nIdx.length) { let q = 0; for (let m = 0; m < M; m++) { while (q < nIdx.length - 1 && nIdx[q] < m) q++; zero[m] = zeroStep[nIdx[q]]; } }

    let AV = new Float64Array(M), AH = new Float64Array(M), AF = new Float64Array(M), RdOff = new Float64Array(M);
    const fric = FRIC_KEYS.map(() => new Float64Array(M));
    const voiced = new Uint8Array(M);
    const bursts = [];
    const range = (t0, t1) => [idxGE(t0), idxGE(t1)];
    segs.forEach(s => {
      const p = get(s.ph);
      const [a, b] = range(s.t0, s.t1);
      const n = s.note >= 0 && s.note < notes.length ? notes[s.note] : null;
      const vel = n ? n.velocity : 0.8;
      const g = Math.pow(10, (vel - 0.8) * 16 / 20) * (s.stress >= 1 ? 1 : 0.82);
      if (s.role === 'breath') { for (let m = a; m < b; m++) AH[m] = 0.15 * bank.breath_level * s.level; return; }
      if (s.role === 'asp') { const L = Math.max(s.t1 - s.t0, 1e-3); for (let m = a; m < b; m++) AH[m] = 1.25 * g * (1 - 0.55 * (ft[m] - s.t0) / L); return; }
      if (s.role === 'clo') { for (let m = a; m < b; m++) { AV[m] = p.voiced ? p.AV * 0.15 * g : 0; voiced[m] = p.voiced ? 1 : 0; } if (s.release) bursts.push([s.t1, 'post', p.burst * g]); return; }
      if (p.cls === 'stop') { for (let m = a; m < b; m++) { AV[m] = p.voiced ? p.AV * g : 0; voiced[m] = p.voiced ? 1 : 0; } if (s.release) bursts.push([s.t1, p.place, p.burst * g * (s.role === 'coda' ? 0.6 : 1)]); return; }
      if (p.cls === 'fric' || p.cls === 'affric') { const fi = FRIC_KEYS.indexOf(p.fric); for (let m = a; m < b; m++) { AF[m] = p.AF * g; AV[m] = p.AV * g; fric[fi][m] = 1; voiced[m] = p.voiced ? 1 : 0; } return; }
      if (p.cls === 'aspir') { for (let m = a; m < b; m++) AH[m] = p.AH * g; return; }
      if (p.cls === 'sil') return;
      if (p.cls === 'glottal') { for (let m = a; m < b; m++) { AV[m] = 0.05; voiced[m] = 1; } return; }
      for (let m = a; m < b; m++) { AV[m] = p.AV * g; voiced[m] = 1; }
      if ((p.cls === 'vowel' || p.cls === 'diph') && n) {
        const L = s.t1 - s.t0;
        if (L > 0.6) for (let m = a; m < b; m++) AV[m] *= 1 + 0.12 * Math.sin(Math.PI * (ft[m] - s.t0) / L);
        if (n.flags.includes('*')) for (let m = a; m < b; m++) RdOff[m] += 0.6;
      }
    });
    for (const s of segs) if (s.phraseStart && s.role === 'nucleus') {
      if (s.hard) {
        const [a, b] = range(s.t0 - 0.03, s.t0); for (let m = a; m < b; m++) AV[m] = 0;
        const [c, d] = range(s.t0, s.t0 + 0.05); for (let m = c; m < d; m++) RdOff[m] -= 0.25;
      } else {
        const [a, b] = range(s.t0 - 0.035, s.t0 + 0.04);
        for (let m = a; m < b; m++) { const u = clip((ft[m] - (s.t0 - 0.035)) / 0.075, 0, 1); AH[m] = Math.max(AH[m], 0.18 * bank.breath_level * (1 - u) + 0.02); RdOff[m] += 0.5 * (1 - u); }
      }
    }
    for (const s of segs) if (s.phraseEnd && ['vowel', 'diph', 'nasal', 'approx'].includes(get(s.ph).cls)) {
      const rel = Math.min(style.release_time, 0.5 * (s.t1 - s.t0));
      const [a, b] = range(s.t1 - rel, s.t1 + 0.01);
      for (let m = a; m < b; m++) AV[m] *= 0.5 + 0.5 * Math.cos(Math.PI * clip((ft[m] - (s.t1 - rel)) / rel, 0, 1));
      let mx = 0; for (let m = a; m < b; m++) mx = Math.max(mx, AV[m]);
      if (b <= a) mx = 1;
      for (let m = a; m < b; m++) { const u = clip((ft[m] - (s.t1 - rel)) / rel, 0, 1); AH[m] += 0.12 * bank.breath_level * Math.sin(Math.PI * u) * mx; RdOff[m] += 0.9 * u; }
    }
    AV = hannSmooth(AV, Math.max(Math.floor(0.012 / dt), 1));
    AH = hannSmooth(AH, Math.max(Math.floor(0.010 / dt), 1));
    AF = hannSmooth(AF, Math.max(Math.floor(0.010 / dt), 1));
    const fricS = fric.map(f => hannSmooth(f, Math.max(Math.floor(0.01 / dt), 1)));
    RdOff = hannSmooth(RdOff, Math.max(Math.floor(0.03 / dt), 1));
    const vs = hannSmooth(Float64Array.from(voiced), 3);
    const voicedS = new Uint8Array(M);
    for (let m = 0; m < M; m++) voicedS[m] = vs[m] > 0.01 ? 1 : 0;
    return { F, B, nas, zero, AV, AH, AF, fric: fricS, RdOff, bursts, voiced: voicedS };
  }

  // ------------------------------------------------------------------ human
  const FUNCTION_WORDS = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'in', 'on', 'at', 'for', 'with', 'is', 'as', 'by', 'it', 'or',
    'but', 'that', 'from', 'be', 'was', 'are', 'my', 'your', 'i', 'you']);
  const VISC = { IH: 0.16, EH: 0.16, AE: 0.22, UH: 0.14, AH: 0.08, AA: 0.06, AO: 0.08, IY: 0.05, UW: 0.08 };
  const VOICED_OBS = new Set(['B', 'D', 'G', 'V', 'Z', 'ZH', 'DH', 'JH', 'DX']);
  const SONOR = new Set(['M', 'N', 'NG', 'L', 'LD', 'R', 'W']);
  const VOICELESS_C = new Set(['P', 'T', 'K', 'F', 'S', 'SH', 'TH', 'CH', 'HH']);
  function viscTarget(v, F, hum) {
    const k = (VISC[v] || 0) * hum;
    if (k <= 0) return F;
    const ax = [600, 1650, 2850, F[3], F[4]];
    return F.map((f, q) => f * (1 - k) + ax[q] * k);
  }
  function humanizeNotes(notes, r, hum) {
    if (hum <= 0) return notes.slice();
    const out = notes.map(n => Object.assign({}, n));
    const phrases = new Map();
    out.forEach(n => { if (!phrases.has(n.phrase)) phrases.set(n.phrase, []); phrases.get(n.phrase).push(n); });
    for (const ns of phrases.values()) {
      const mean = ns.reduce((a, n) => a + n.midi, 0) / ns.length;
      let peak = 0;
      ns.forEach((n, k) => { const a = ns[peak]; if (n.midi > a.midi || (n.midi === a.midi && n.t1 - n.t0 > a.t1 - a.t0)) peak = k; });
      ns.forEach((n, k) => {
        let d = r.normal(0, 0.011 * hum);
        if (n.syl && n.syl.stress === 1) d -= 0.005 * hum;
        if (k === 0) d += 0.008 * hum;
        n.t0 += clip(d, -0.03 * hum, 0.03 * hum);
        const arc = Math.exp(-0.5 * ((k - peak) / Math.max(1.5, ns.length / 3)) ** 2);
        let v = n.velocity + hum * (0.05 * arc + 0.008 * (n.midi - mean));
        if (n.syl) { if (FUNCTION_WORDS.has(n.syl.word) && n.syl.word.length < 5) v -= 0.05 * hum; else if (n.syl.stress === 1) v += 0.025 * hum; }
        if (k === ns.length - 1) v -= 0.03 * hum;
        v += r.normal(0, 0.02 * hum);
        n.velocity = clip(v, 0.35, 1.15);
      });
      for (let k = 0; k < ns.length - 1; k++) { if (ns[k + 1].t0 <= ns[k].t0 + 0.04) ns[k + 1].t0 = ns[k].t0 + 0.04; ns[k].t1 = ns[k + 1].t0; }
      ns[ns.length - 1].t1 += r.normal(0, 0.01 * hum);
    }
    return out;
  }
  function microprosody(cents, segs, ft, hum) {
    if (hum <= 0) return cents;
    const c = Float64Array.from(cents), T = ft.length, t00 = ft[0], dt = ft[1] - ft[0];
    const idx = t => clip(Math.ceil((t - t00) / dt - 1e-9), 0, T);
    segs.forEach((s, i) => {
      if (VOICED_OBS.has(s.ph) || SONOR.has(s.ph)) {
        const depth = (VOICED_OBS.has(s.ph) ? 55 : 22) * hum, a = s.t0 - 0.02, len = s.t1 - s.t0 + 0.05;
        for (let m = idx(a); m < idx(s.t1 + 0.03); m++) { const u = clip((ft[m] - a) / len, 0, 1); c[m] -= depth * Math.sin(Math.PI * u) ** 2; }
      }
      if (VOICELESS_C.has(s.ph) && (s.role === 'onset' || s.role === 'asp')) {
        const nx = segs[i + 1];
        if (nx && nx.role === 'nucleus') for (let m = idx(nx.t0); m < T; m++) { const e = Math.exp(-(ft[m] - nx.t0) / 0.04); if (e < 1e-4) break; c[m] += 32 * hum * e; }
      }
    });
    return c;
  }
  function liveControls(c, segs, notes, ft, r, hum, styleName) {
    const M = ft.length, fs = 1 / (ft[1] - ft[0]), t00 = ft[0], dt = ft[1] - ft[0];
    const idx = t => clip(Math.ceil((t - t00) / dt - 1e-9), 0, M);
    const creak = new Float64Array(M);
    if (hum > 0) {
      [[0.022, 2.5], [0.018, 2.0], [0.012, 1.6]].forEach(([sd, fc], q) => { const n = smoothNoise(r, M, fs, fc, sd); for (let m = 0; m < M; m++) c.F[m * 5 + q] *= Math.exp(hum * n[m]); });
      const nb = smoothNoise(r, M, fs, 2.0, 0.08); for (let m = 0; m < M; m++) { const f = Math.exp(hum * nb[m]); for (let q = 0; q < 5; q++) c.B[m * 5 + q] *= f; }
      const na = smoothNoise(r, M, fs, 3.0, 0.9); for (let m = 0; m < M; m++) c.AV[m] *= Math.pow(10, hum * na[m] / 20);
      const nr = smoothNoise(r, M, fs, 1.5, 0.07); for (let m = 0; m < M; m++) c.RdOff[m] += hum * nr[m];
      const nf = smoothNoise(r, M, fs, 6.0, 1.2); for (let m = 0; m < M; m++) c.AF[m] *= Math.pow(10, hum * nf[m] / 20);
      for (const s of segs) if (['S', 'SH', 'F', 'TH', 'Z', 'ZH', 'V', 'DH', 'HH'].includes(s.ph) && (s.role === 'onset' || s.role === 'coda')) {
        const a = idx(s.t0), b = idx(s.t1);
        if (b - a > 2) { const g = r.uniform(0.85, 1.15); for (let m = a; m < b; m++) { const u = clip((ft[m] - s.t0) / (s.t1 - s.t0), 0, 1); c.AF[m] *= 0.55 + 0.45 * Math.pow(Math.sin(Math.PI * u), 0.45) * g; } }
      }
    }
    const pc = ({ speak: 0.55, intimate: 0.45, pop: 0.25, belt: 0.08 }[styleName] || 0) * Math.min(hum, 1);
    const lastV = new Map();
    for (const s of segs) if (s.role === 'nucleus' && isVowel(s.ph) && s.note >= 0 && s.note < notes.length) lastV.set(notes[s.note].phrase, s);
    for (const s of lastV.values()) {
      const n = notes[s.note];
      if (n.midi > 64 || n.flags.includes('v') || n.flags.includes('=')) continue;
      if (r.random() < pc) {
        const L = Math.min(0.16, 0.45 * (s.t1 - s.t0));
        for (let m = idx(s.t1 - L); m < idx(s.t1 + 0.02); m++) { const u = clip((ft[m] - (s.t1 - L)) / L, 0, 1); creak[m] = Math.max(creak[m], Math.pow(Math.sin(0.5 * Math.PI * u), 0.7)); }
      }
    }
    c.creak = creak;
    return c;
  }

  // ------------------------------------------------------------------ source (LF)
  const RD_GRID = []; for (let i = 0; i < 28; i++) RD_GRID.push(+(0.3 + 0.1 * i).toFixed(2));
  const N_HARM = 200;
  let LF_TAB = null;
  function lfPeriod(rd, n) {
    const ra = (-1 + 4.8 * rd) / 100, rk = (22.4 + 11.8 * rd) / 100;
    const rg = rk / (4 * (0.11 * rd / (0.5 + 1.2 * rk) - ra));
    const tp = 1 / (2 * rg);
    let te = Math.min(tp * (1 + rk), 0.97);
    const ta = Math.max(ra, 1e-4), tc = 1;
    const f = e => e * ta - 1 + Math.exp(-e * (tc - te));
    let lo = 1e-6, hi = 1e5, eps;
    if (f(hi) > 0) { for (let it = 0; it < 200; it++) { const mid = Math.sqrt(lo * hi); if (f(mid) > 0) hi = mid; else lo = mid; } eps = Math.sqrt(lo * hi); }
    else eps = 1 / ta;
    const wg = Math.PI / tp;
    const t = new Float64Array(n); for (let i = 0; i < n; i++) t[i] = (i + 0.5) / n;
    const wave = alpha => {
      const e = new Float64Array(n);
      const E0 = -1 / (Math.exp(alpha * te) * Math.sin(wg * te));
      const tail = Math.exp(-eps * (tc - te));
      for (let i = 0; i < n; i++) e[i] = t[i] <= te ? E0 * Math.exp(alpha * t[i]) * Math.sin(wg * t[i]) : -(1 / (eps * ta)) * (Math.exp(-eps * (t[i] - te)) - tail);
      return e;
    };
    const g = a => { const e = wave(a); let s = 0; for (let i = 0; i < n; i++) s += e[i]; return s; };
    let a0 = -60, a1 = 60, g0 = g(a0), g1 = g(a1), alpha = 0;
    if (g0 * g1 < 0) { for (let it = 0; it < 60; it++) { const mid = 0.5 * (a0 + a1), gm = g(mid); if (gm * g0 > 0) { a0 = mid; g0 = gm; } else { a1 = mid; g1 = gm; } } alpha = 0.5 * (a0 + a1); }
    return wave(alpha);
  }
  function lfTable() {
    if (LF_TAB) return LF_TAB;
    const n = 4096, R_ = RD_GRID.length;
    const logmag = new Float64Array(R_ * (N_HARM + 1)), phase = new Float64Array(R_ * (N_HARM + 1));
    const raw = [];
    for (let r = 0; r < R_; r++) {
      const e = lfPeriod(RD_GRID[r], n);
      const re = Float64Array.from(e), im = new Float64Array(n);
      fft(re, im, false);
      const cr = new Float64Array(N_HARM + 1), ci = new Float64Array(N_HARM + 1);
      let en = 0;
      for (let k = 1; k <= N_HARM; k++) { cr[k] = re[k] / n; ci[k] = im[k] / n; if (k <= 30) en += cr[k] * cr[k] + ci[k] * ci[k]; }
      const sc = 1 / Math.sqrt(en);
      raw.push([cr.map(v => v * sc), ci.map(v => v * sc)]);
    }
    for (let k = 1; k <= N_HARM; k++) {
      let prev = null;
      for (let r = 0; r < R_; r++) {
        const [cr, ci] = raw[r];
        logmag[r * (N_HARM + 1) + k] = Math.log(Math.hypot(cr[k], ci[k]) + 1e-12);
        let ph = Math.atan2(ci[k], cr[k]);
        if (prev !== null) { while (ph - prev > Math.PI) ph -= 2 * Math.PI; while (ph - prev < -Math.PI) ph += 2 * Math.PI; }
        phase[r * (N_HARM + 1) + k] = ph; prev = ph;
      }
    }
    LF_TAB = { logmag, phase };
    return LF_TAB;
  }

  // ------------------------------------------------------------------ synthesis
  function higherPoles(scale) { const out = []; for (let i = 6; i <= 14; i++) out.push([(2 * i - 1) * 600 * scale, 0.11 * (2 * i - 1) * 600 * scale]); return out; }

  // resonator coefficients [num, c, r^2] for a digital 2-pole resonator, unity gain at DC
  function resCoef(F, B, sr) { const r = Math.exp(-Math.PI * B / sr), c = 2 * r * Math.cos(2 * Math.PI * F / sr); return [1 - c + r * r, c, r * r]; }
  function frameCoefs(Fm, Bm, zeroF, sr) {
    const out = [];
    for (let q = 0; q < 5; q++) out.push(resCoef(Fm[q], Bm[q], sr));
    out.zero = resCoef(zeroF, 220, sr);
    return out;
  }
  const NASAL_POLE = resCoef(1000, 260, 44100);
  // complex tract response at one frequency (z^-1 = zc); returns [re, im]
  function tractAt(coefs, extraC, nas, zc) {
    const z1r = zc[0], z1i = zc[1];
    const z2r = z1r * z1r - z1i * z1i, z2i = 2 * z1r * z1i;
    let hr = 1, hi = 0;
    const mul = (k, inv) => {
      const num = k[0], c = k[1], rr = k[2];
      const dr = 1 - c * z1r + rr * z2r, di = -c * z1i + rr * z2i;
      let qr, qi;
      if (!inv) { const d = dr * dr + di * di; qr = num * dr / d; qi = -num * di / d; }
      else { qr = dr / num; qi = di / num; }
      const tr = hr * qr - hi * qi; hi = hr * qi + hi * qr; hr = tr;
    };
    for (let q = 0; q < 5; q++) mul(coefs[q], false);
    for (let q = 0; q < extraC.length; q++) mul(extraC[q], false);
    if (nas > 0) {
      const sr0 = hr, si0 = hi;
      hr = 1; hi = 0; mul(NASAL_POLE, false); mul(coefs.zero, true);
      const pr = (1 - nas) + nas * hr, pi = nas * hi;
      hr = sr0 * pr - si0 * pi; hi = sr0 * pi + si0 * pr;
    }
    return [hr, hi];
  }

  function lpNoise(r, n, sr, fc, std) {
    const a = Math.exp(-2 * Math.PI * fc / sr);
    const y = new Float64Array(n);
    let s = 0, m = 0;
    for (let i = 0; i < n; i++) { s = (1 - a) * r.normal() + a * s; y[i] = s; m += s; }
    m /= n; let v = 0;
    for (let i = 0; i < n; i++) v += (y[i] - m) ** 2;
    const sd = Math.sqrt(v / n) || 1;
    for (let i = 0; i < n; i++) y[i] = y[i] / sd * std;
    return y;
  }

  function mvfHz(bank, rd) { return bank.mvf * clip(1.25 - 0.25 * rd, 0.6, 1.3); }
  function harmonicWeight(f, mvf, hum) { const u = clip((f - (mvf - 800)) / 1600, 0, 1); const w = 0.5 + 0.5 * Math.cos(Math.PI * u); return 1 - Math.min(hum, 1) * (1 - w); }
  function sourceMagFrac(tab, rd, kf) {
    const NH1 = N_HARM + 1;
    rd = clip(rd, RD_GRID[0], RD_GRID[RD_GRID.length - 1]);
    const pos = (rd - RD_GRID[0]) / 0.1, i0 = clip(Math.floor(pos), 0, RD_GRID.length - 2), fr = pos - i0;
    kf = clip(kf, 1, N_HARM - 1.001);
    const k0 = Math.floor(kf), u = kf - k0;
    const L0 = tab.logmag[i0 * NH1 + k0] * (1 - u) + tab.logmag[i0 * NH1 + k0 + 1] * u;
    const L1 = tab.logmag[(i0 + 1) * NH1 + k0] * (1 - u) + tab.logmag[(i0 + 1) * NH1 + k0 + 1] * u;
    return Math.exp(L0 * (1 - fr) + L1 * fr);
  }

  function synthesize(c, f0, Rd, sr, hop, bank, r, hum = 0) {
    const M = f0.length, N = M * hop;
    const fmax = 14000;
    let f0min = Infinity; for (let m = 0; m < M; m++) f0min = Math.min(f0min, f0[m]);
    const K = Math.min(199, Math.floor(Math.min(fmax, 0.45 * sr) / Math.max(f0min, 60)) + 1);
    const extraC = higherPoles(bank.formant_scale).map(([F, B]) => resCoef(F, B, sr));
    const tab = lfTable(), NH1 = N_HARM + 1;
    const ZR = new Float32Array(M * K), ZI = new Float32Array(M * K);
    const presG = Math.pow(10, bank.presence_db / 20) - 1;
    // phase wander of high harmonics: one slow random walk per harmonic
    const pa = Math.exp(-2 * Math.PI * 4.0 / (sr / hop)), psd = Math.sqrt((1 - pa) / (1 + pa));
    const psi = new Float64Array(K + 1);
    for (let k = 1; k <= K; k++) psi[k] = r.normal() * psd;
    const doDisp = hum > 0 && bank.phase_disp > 0;
    for (let m = 0; m < M; m++) {
      if (doDisp) for (let k = 1; k <= K; k++) psi[k] = pa * psi[k] + (1 - pa) * r.normal();
      const mvf = mvfHz(bank, Rd[m]);
      const rd = clip(Rd[m], RD_GRID[0], RD_GRID[RD_GRID.length - 1]);
      const pos = (rd - RD_GRID[0]) / 0.1;
      const i0 = clip(Math.floor(pos), 0, RD_GRID.length - 2), fr = pos - i0;
      const Ra = Math.max((-1 + 4.8 * Rd[m]) / 100, 0.003), Fa = f0[m] / (2 * Math.PI * Ra);
      const av = c.AV[m];
      if (av < 1e-7) continue;
      const coefs = frameCoefs(c.F.subarray(m * 5, m * 5 + 5), c.B.subarray(m * 5, m * 5 + 5), c.zero[m], sr);
      for (let k = 1; k <= K; k++) {
        const fk = f0[m] * k;
        const lm = tab.logmag[i0 * NH1 + Math.min(k, N_HARM)] * (1 - fr) + tab.logmag[(i0 + 1) * NH1 + Math.min(k, N_HARM)] * fr;
        const gp = tab.phase[i0 * NH1 + Math.min(k, N_HARM)] * (1 - fr) + tab.phase[(i0 + 1) * NH1 + Math.min(k, N_HARM)] * fr;
        let gm = Math.exp(lm);
        if (bank.ra_scale !== 1) gm *= Math.sqrt(1 + (fk / Fa) ** 2) / Math.sqrt(1 + (fk * bank.ra_scale / Fa) ** 2);
        const w = 2 * Math.PI * Math.min(fk, sr * 0.499) / sr;
        const [hr, hi] = tractAt(coefs, extraC, c.nas[m], [Math.cos(w), -Math.sin(w)]);
        const P = 1 + presG * Math.exp(-(((fk - bank.presence_hz) / 900) ** 2));
        const taper = clip((fmax - fk) / (0.15 * fmax), 0, 1);
        let ph = gp;
        if (doDisp) ph += bank.phase_disp * Math.PI * Math.min(hum, 1) * clip((fk - 1500) / 3500, 0, 1) * psi[k] / psd;
        const zr = gm * Math.cos(ph), zi = gm * Math.sin(ph);
        const Zr = zr * hr - zi * hi, Zi = zr * hi + zi * hr;
        const amp = P * taper * av * harmonicWeight(fk, mvf, hum);
        ZR[m * K + k - 1] = Zr * amp; ZI[m * K + k - 1] = Zi * amp;
      }
    }
    // glottal phase with jitter, shimmer
    const jit = lpNoise(r, N, sr, bank.jitter_hz, bank.jitter), shim = lpNoise(r, N, sr, bank.shimmer_hz, bank.shimmer);
    // a fresh period and amplitude perturbation every glottal cycle; fry alternates pulse strength
    const phi = new Float64Array(N), cycAmp = new Float64Array(N);
    const creakAt = n => { if (!c.creak) return 0; const pos = n / hop, i = Math.min(Math.floor(pos), M - 1), fr = pos - i; return i < M - 1 ? c.creak[i] + (c.creak[i + 1] - c.creak[i]) * fr : c.creak[M - 1]; };
    const drawAmp = (cyc, cr) => 1 + r.normal() * bank.cycle_shimmer * hum + 0.55 * cr * (cyc % 2 === 0 ? 1 : -1);
    let acc = 0, cyc = 0, cj = r.normal() * bank.cycle_jitter * hum, aCur = drawAmp(0, 0), aNext = drawAmp(1, 0);
    for (let n = 0; n < N; n++) {
      const pos = n / hop, i = Math.min(Math.floor(pos), M - 1), fr = pos - i;
      const f = i < M - 1 ? f0[i] + (f0[i + 1] - f0[i]) * fr : f0[M - 1];
      acc += 2 * Math.PI * f * (1 + jit[n]) * (1 + cj) / sr; phi[n] = acc;
      const cc = Math.floor(acc / (2 * Math.PI));
      if (cc > cyc) {
        cyc = cc; const cr = creakAt(n);
        cj = r.normal() * (bank.cycle_jitter * hum + 0.05 * cr);
        aCur = aNext; aNext = drawAmp(cyc + 1, cr);
      }
      const u = acc / (2 * Math.PI) - cyc;
      cycAmp[n] = aCur * (1 - u) + aNext * u;
    }
    const yh = new Float64Array(N);
    // each harmonic is Re[Z_k e^{j k phi}], with Z_k interpolated between frames;
    // e^{j k phi} comes from repeated rotation by e^{j phi} (no cos per harmonic)
    for (let m = 0; m < M - 1; m++) {
      const base = m * K, nb = base + K;
      let active = 0;
      for (let k = 0; k < K; k++) if (Math.abs(ZR[base + k]) + Math.abs(ZI[base + k]) + Math.abs(ZR[nb + k]) + Math.abs(ZI[nb + k]) > 1e-7) active = k + 1;
      if (!active) continue;
      for (let s = 0; s < hop; s++) {
        const n = m * hop + s, fr = s / hop, p = phi[n];
        const c1 = Math.cos(p), s1 = Math.sin(p);
        let C = c1, S = s1, v = 0;
        for (let k = 0; k < active; k++) {
          const zr = ZR[base + k] + (ZR[nb + k] - ZR[base + k]) * fr;
          const zi = ZI[base + k] + (ZI[nb + k] - ZI[base + k]) * fr;
          v += zr * C - zi * S;
          const t = C * c1 - S * s1; S = S * c1 + C * s1; C = t;
        }
        yh[n] = v * (1 + shim[n]) * cycAmp[n];
      }
    }
    // noise: per-frame shaped spectra, inverse FFT, windowed overlap-add
    const nfft = 512, nb = nfft / 2 + 1;
    const win = new Float64Array(nfft); for (let i = 0; i < nfft; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / nfft);
    const freqs = new Float64Array(nb); for (let b = 0; b < nb; b++) freqs[b] = b * sr / nfft;
    const zcs = []; for (let b = 0; b < nb; b++) { const w = 2 * Math.PI * Math.min(freqs[b], sr * 0.499) / sr; zcs.push([Math.cos(w), -Math.sin(w)]); }
    const aspTilt = new Float64Array(nb), air = new Float64Array(nb);
    for (let b = 0; b < nb; b++) {
      const f = freqs[b], hp = (f / 500) ** 2;
      aspTilt[b] = Math.sqrt(hp / (1 + hp)) / Math.sqrt(1 + (f / 10000) ** 2);
      const q = (f / bank.air_hz) ** 2; air[b] = q / (1 + q) / Math.sqrt(1 + (f / 15000) ** 4);
    }
    const fs_ = bank.formant_scale;
    const shapes = FRIC_KEYS.map(key => {
      const sp = D.fric[key], mag = new Float64Array(nb);
      let mx = 0;
      for (let b = 0; b < nb; b++) {
        let v = Math.pow(10, sp.floor / 20);
        for (const [fc, bw, gdb] of sp.peaks) v += Math.pow(10, gdb / 20) * Math.exp(-0.5 * ((freqs[b] - fc * fs_) / (bw * fs_ / 2.355)) ** 2);
        const q = (freqs[b] / (sp.hp * fs_)) ** 2; v *= q / Math.sqrt(1 + q * q); mag[b] = v; mx = Math.max(mx, v);
      }
      for (let b = 0; b < nb; b++) mag[b] /= mx;
      return mag;
    });
    // independent random spectra per frame overlap-add incoherently (variance 1/4 of a
    // filtered continuous noise under this Hann WOLA), so scale by 2 to match the Python engine
    const sw2 = 4 * (3 * nfft / 8), sdc = Math.sqrt(sw2 / 2);
    const outA = new Float64Array(N + nfft), outF = new Float64Array(N + nfft), norm = new Float64Array(N + nfft);
    const re = new Float64Array(nfft), im = new Float64Array(nfft), re2 = new Float64Array(nfft), im2 = new Float64Array(nfft);
    const EA = new Float64Array(nb), EF = new Float64Array(nb);
    for (let m = 0; m < M; m++) {
      const ah = c.AH[m], ab = c.AB ? c.AB[m] : 0, af = c.AF[m], avm = hum > 0 ? c.AV[m] : 0;
      const start = m * hop;            // frame covers [start - nfft/2, start + nfft/2) in output coords + nfft/2 offset
      for (let i = 0; i < nfft; i++) norm[start + i] += win[i] * win[i];
      if (ah < 1e-6 && ab < 1e-6 && af < 1e-6 && avm < 1e-6) continue;
      // above the maximum voiced frequency the voice continues as noise with the same envelope
      const mvf = mvfHz(bank, Rd[m]), hfScale = Math.sqrt(sr / (4 * f0[m]));
      const Ra = Math.max((-1 + 4.8 * Rd[m]) / 100, 0.003), Fa = f0[m] / (2 * Math.PI * Ra);
      const coefs = frameCoefs(c.F.subarray(m * 5, m * 5 + 5), c.B.subarray(m * 5, m * 5 + 5), c.zero[m], sr);
      for (let b = 0; b < nb; b++) {
        let ea = 0;
        const f = freqs[b];
        const wv = avm > 1e-6 ? harmonicWeight(f, mvf, hum) : 1;
        if (ah > 1e-6 || ab > 1e-6 || wv < 0.999) {
          const [hr, hi] = tractAt(coefs, extraC, c.nas[m], zcs[b]);
          const H = Math.hypot(hr, hi);
          ea = (H * aspTilt[b] * ah + Math.sqrt(H) * air[b] * ab * bank.air_gain) * bank.asp_gain;
          if (wv < 0.999) {
            let G = sourceMagFrac(tab, Rd[m], f / f0[m]);
            if (bank.ra_scale !== 1) G *= Math.sqrt(1 + (f / Fa) ** 2) / Math.sqrt(1 + (f * bank.ra_scale / Fa) ** 2);
            const P = 1 + presG * Math.exp(-(((f - bank.presence_hz) / 900) ** 2));
            ea += G * H * P * Math.sqrt(Math.max(0, 1 - wv * wv)) * clip((14000 - f) / 2100, 0, 1) * avm * hfScale;
          }
        }
        EA[b] = ea;
        let ef = 0;
        if (af > 1e-6) for (let q = 0; q < FRIC_KEYS.length; q++) ef += c.fric[q][m] * shapes[q][b];
        EF[b] = ef * af * bank.fric_gain;
      }
      for (let b = 0; b < nb; b++) {
        const edge = b === 0 || b === nb - 1;
        const s = edge ? Math.sqrt(sw2) : sdc;
        re[b] = r.normal() * s * EA[b]; im[b] = edge ? 0 : r.normal() * s * EA[b];
        re2[b] = r.normal() * s * EF[b]; im2[b] = edge ? 0 : r.normal() * s * EF[b];
      }
      for (let b = 1; b < nb - 1; b++) { re[nfft - b] = re[b]; im[nfft - b] = -im[b]; re2[nfft - b] = re2[b]; im2[nfft - b] = -im2[b]; }
      fft(re, im, true); fft(re2, im2, true);
      for (let i = 0; i < nfft; i++) { outA[start + i] += re[i] * win[i]; outF[start + i] += re2[i] * win[i]; }
    }
    const yn = new Float64Array(N);
    for (let n = 0; n < N; n++) {
      const q = n + nfft / 2, nv = Math.max(norm[q], 1e-3);
      const pos = n / hop, i = Math.min(Math.floor(pos), M - 1), fr = pos - i;
      const av = i < M - 1 ? c.AV[i] + (c.AV[i + 1] - c.AV[i]) * fr : c.AV[M - 1];
      const depth = clip(av / 0.6, 0, 1) * bank.pulse_depth;
      const pulse = (0.5 + 0.5 * Math.cos(phi[n] - 2 * Math.PI * 0.42)) ** 2;
      yn[n] = outA[q] / nv * (1 - depth + depth * 1.6 * pulse) + outF[q] / nv * (1 - 0.5 * depth + 0.5 * depth * 1.6 * pulse);
    }
    // bursts
    const yb = new Float64Array(N);
    for (const [t, place, strength] of c.bursts) {
      const [lo, hi, tau] = D.burst[place] || D.burst.alv;
      const n0 = Math.floor((t - c.t0) * sr);
      if (n0 < 0 || n0 >= N || strength <= 0) continue;
      const L = Math.floor(0.025 * sr), b = new Float64Array(L);
      for (let i = 0; i < L; i++) b[i] = r.normal() * Math.exp(-i / sr / tau) * (i < 26 ? i / 26 : 1);
      biquadRun(b, 'highpass', lo, sr); biquadRun(b, 'highpass', lo, sr);
      biquadRun(b, 'lowpass', Math.min(hi, sr * 0.45), sr); biquadRun(b, 'lowpass', Math.min(hi, sr * 0.45), sr);
      let mx = 1e-9; for (let i = 0; i < L; i++) mx = Math.max(mx, Math.abs(b[i]));
      for (let i = 0; i < L && n0 + i < N; i++) yb[n0 + i] += bank.burst_gain * strength * b[i] / mx;
    }
    const y = new Float64Array(N);
    for (let n = 0; n < N; n++) y[n] = yh[n] + yn[n] + yb[n];
    return { y, yh, yn, yb };
  }

  function biquadRun(x, type, f0, sr, q = Math.SQRT1_2) {
    const w = 2 * Math.PI * f0 / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (type === 'lowpass') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; } else { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; }
    const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; x[i] = v;
    }
  }

  // ------------------------------------------------------------------ singer
  function makeBank(name = 'idol', over = {}) {
    const b = Object.assign({}, D.bank_default, D.banks[name] || {}, over, { name });
    b.formant_scale = Math.pow(2, 0.17 * b.GEN);
    b.ra_scale = Math.pow(0.5, (b.BRI - 0.2) * 3.5);
    b.presence_db = -1 + 7 * b.BRI;
    b.bw_scale = 1.25 - 0.5 * b.CLE;
    return b;
  }

  function prepare(score, { style = 'pop', tune = 'pop', seed = 1, bank = null, vibScale = 1, notes = null, sr = 44100, firstBreath = true } = {}) {
    const st0 = typeof style === 'string' ? D.styles[style] : style;
    const st = Object.assign({}, st0, { pitch: Object.assign({}, st0.pitch, { vib_depth: st0.pitch.vib_depth * vibScale }) });
    const at = typeof tune === 'string' ? D.tunes[tune] : tune;
    const B0 = bank || makeBank('idol');
    const r = rng(seed * 7919 + 17), rH = rng(seed * 104729 + 7777);
    const written = notes || score.notes;
    if (!written.length) throw new Error('Nothing to sing yet. Add some notes and lyrics.');
    const hum = (B0.HUM === undefined ? 1 : B0.HUM) * (st.hum_mul === undefined ? 1 : st.hum_mul);
    const B = Object.assign({}, B0, { HUM: hum });
    const hop = 128, pre = 0.5, dt = hop / sr;
    const end = Math.max(...written.map(n => n.t1)) + 0.6;
    const M = Math.ceil((end + pre) / dt);
    const ft = new Float64Array(M); for (let i = 0; i < M; i++) ft[i] = -pre + i * dt;
    const sung = humanizeNotes(written, rH, hum);
    const { segs } = layout(sung, B.VEL * st.vel_mul, true, rH, hum, firstBreath);
    const nat = perform(sung, ft, st.pitch, r, hum);
    const natC = microprosody(nat.cents, segs, ft, hum);
    const cor = correct(natC, ft, sung, at, score.key);
    const c = buildControls(segs, sung, ft, B, st, r);
    liveControls(c, segs, sung, ft, rH, hum, st.name);
    const cents = Float64Array.from(cor.cents);
    for (let m = 0; m < M; m++) cents[m] -= 280 * c.creak[m];
    return { st, B, hum, r, sr, hop, pre, M, ft, sung, segs, vib: nat.vib, centsNat: natC, cents, targets: cor.targets, c };
  }

  function render(score, opts = {}) {
    const P = prepare(score, opts);
    const { st, B, hum, r, sr, hop, pre, M, ft, sung, segs, c, cents } = P;
    const f0 = new Float64Array(M); for (let i = 0; i < M; i++) f0[i] = 440 * Math.pow(2, (cents[i] / 100 - 69) / 12);
    c.t0 = -pre;
    for (let m = 0; m < M; m++) {
      for (let q = 0; q < 5; q++) c.F[m * 5 + q] *= B.formant_scale;
      c.F[m * 5] *= 1 + 0.12 * B.OPE;
      if (c.voiced[m] && f0[m] > 360 && c.F[m * 5] < 1.05 * f0[m]) c.F[m * 5] = 1.05 * f0[m];
      for (let q = 0; q < 5; q++) { c.F[m * 5 + q] = Math.min(c.F[m * 5 + q], sr * 0.45); c.B[m * 5 + q] *= B.bw_scale; }
      c.B[m * 5] += 0.06 * Math.max(f0[m] - 250, 0);
      c.AV[m] *= 1 + 0.004 * P.vib[m];
    }
    const vel = new Float64Array(M).fill(0.8);
    for (const n of sung) for (let m = 0; m < M; m++) if (ft[m] >= n.t0 - 0.05 && ft[m] < n.t1) vel[m] = n.velocity;
    const Rd = new Float64Array(M);
    for (let m = 0; m < M; m++) {
      let rd = B.rd_base + st.rd_offset + 0.9 * (B.BRE - 0.3) - 0.4 * (B.BRI - 0.5) - B.rd_dyn * (vel[m] - 0.8) + B.rd_pitch * clip(cents[m] / 100 - 64, -6, 12) + c.RdOff[m];
      rd = rd * (1 - c.creak[m]) + 0.55 * c.creak[m];
      c.AV[m] *= 1 - 0.3 * c.creak[m];
      Rd[m] = clip(rd, 0.35, 2.9);
    }
    const breath = B.BRE * st.breath_mul * (1.15 - 0.6 * B.CLE);
    c.AB = new Float64Array(M);
    for (let m = 0; m < M; m++) { c.AH[m] *= B.breath_level; c.AB[m] = 5 * breath * c.AV[m] * (0.35 + 0.25 * clip(Rd[m] - 0.8, 0, 2)) * (1 - c.creak[m]); }
    const out = synthesize(c, f0, Rd, sr, hop, B, r, hum);
    const nPre = Math.round(pre * sr);
    const audio = new Float32Array(out.y.length - nPre);
    for (let i = 0; i < audio.length; i++) audio[i] = out.y[i + nPre] * 0.25;
    return { audio, sr, segs, ft, sung, hum, centsNat: P.centsNat, cents, targets: P.targets, f0, controls: c, Rd,
      parts: { harm: out.yh.subarray(nPre), noise: out.yn.subarray(nPre), burst: out.yb.subarray(nPre) } };
  }

  // timing + pitch only (no audio): for drawing the performance quickly
  function plan(score, opts = {}) {
    const P = prepare(score, opts);
    return { segs: P.segs, ft: P.ft, sung: P.sung, centsNat: P.centsNat, cents: P.cents, controls: P.c };
  }

  // ------------------------------------------------------------------ speech (announcer)
  const SP = D.speech;
  const SP_FN = new Set(SP.function_words);
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function numberWords(n) {
    n = parseInt(n, 10);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 === 0 ? '' : ' ' + ONES[n % 10]);
    if (n < 1000) { const rest = n % 100; return ONES[Math.floor(n / 100)] + ' hundred' + (rest === 0 ? '' : ' ' + numberWords(rest)); }
    return String(n).split('').map(d => ONES[+d]).join(' ');
  }
  function normalizeText(text) {
    text = text.replace(/…/g, '...').replace(/—/g, ',').replace(/&/g, ' and ');
    text = text.replace(/\bx\s*(\d+)\b/g, (m, d) => 'times ' + d);
    text = text.replace(/\d+/g, m => ' ' + numberWords(m) + ' ');
    return text.replace(/[ \t]+/g, ' ').trim();
  }
  function splitPhrases(text) {
    const out = [], re = /([^.,!?;:]+)(\.\.\.|[.,!?;:]+)?/g;
    let m;
    while ((m = re.exec(text))) {
      const chunk = m[1].trim(), p = m[2] || '';
      if (!chunk) continue;
      let b;
      if (p.startsWith('...')) b = 'long';
      else if (p.includes('!')) b = 'excl';
      else if (p.includes('?')) b = 'q';
      else if ([',', ';', ':'].includes(p.slice(0, 1))) b = 'short';
      else b = 'end';
      out.push([chunk, b]);
    }
    return out;
  }
  function prosody(chunk, boundary, spk) {
    const { tokens, guessed, words } = parseLyrics(chunk);
    const sylls = tokens.filter(t => t !== '_');
    const n = sylls.length;
    if (!n) return { out: [], guessed, words };
    const isFn = sylls.map(s => SP_FN.has(s.word) && s.word.length < 5);
    let acc = sylls.map((s, i) => (s.stress === 1 && !isFn[i]) ? i : -1).filter(i => i >= 0);
    if (!acc.length) { const st = sylls.map((s, i) => s.stress === 1 ? i : -1).filter(i => i >= 0); acc = [st.length ? st[st.length - 1] : n - 1]; }
    const nuc = acc[acc.length - 1];
    let lastWordStart = 0; sylls.forEach((s, i) => { if (s.wordInitial) lastWordStart = i; });
    const stretch = nuc >= lastWordStart ? nuc : n - 1;
    const base = spk.base, rg = spk.range, rate = spk.rate;
    const out = [];
    let level = base + 0.2 * rg, k = 0;
    sylls.forEach((s, i) => {
      let d = (s.stress === 1 ? 0.24 : 0.13) + 0.028 * (s.onset.length + s.coda.length);
      if (isFn[i]) d *= 0.8;
      d *= rate;
      if (i === stretch) { d *= ['excl', 'end', 'q'].includes(boundary) ? spk.final : spk.final * 0.7; if (boundary === 'excl') d *= 1.12; }
      else if (i > stretch) d *= 1.25;
      const decl = -1.5 * (n > 1 ? i / (n - 1) : 0);
      if (spk.mode === 'steps') {
        let a, b, vel;
        if (i === nuc) {
          [a, b] = ({ excl: [base + 7, base - 5], q: [base, base + 8], end: [base + 3, base - 2] })[boundary] || [base + 5, base + 5];
          vel = boundary === 'excl' ? 1.0 : 0.88;
        } else if (i > nuc) {
          a = b = ({ excl: base - 5, q: base + 8, end: base - 2 })[boundary] ?? base + 5; vel = 0.8;
        } else {
          const key = s.onset.concat(s.nucleus, s.coda).join('');
          let sum = 0; for (const ch of key) sum += ch.charCodeAt(0);
          a = b = base + SP.steps[(sum * 31 + 7 * i) % SP.steps.length] + (acc.includes(i) ? 2 : 0);
          vel = acc.includes(i) ? 0.9 : 0.8;
        }
        out.push({ syl: s, dur: d, a, b, vel });
        return;
      }
      if (i === nuc) {
        let a, b;
        if (boundary === 'excl') { a = base + rg; b = base - 1.5; }
        else if (boundary === 'end') { a = base + 0.6 * rg; b = base - 2.5; }
        else if (boundary === 'q') { a = base + 0.5; b = base + 1.1 * rg; }
        else { a = base + 0.55 * rg; b = base + 0.7 * rg; }
        out.push({ syl: s, dur: d, a, b, vel: boundary === 'excl' ? 1.0 : 0.9 });
        level = b;
      } else if (acc.includes(i)) {
        const p = base + rg * 0.8 * Math.pow(0.85, k) + decl;
        k++;
        const [a, b] = d > 0.28 ? [p + 0.5, p - 0.8] : [p, p];
        out.push({ syl: s, dur: d, a, b, vel: 0.92 });
        level = p - 0.35 * rg;
      } else {
        const p = (k === 0 && i < nuc) ? base + 0.2 * rg + decl : level;
        out.push({ syl: s, dur: d, a: p, b: p, vel: isFn[i] ? 0.7 : 0.76 });
      }
    });
    return { out, guessed, words };
  }
  function addTokens(sc, tokens, spec, at) {
    let b = at, prev = null;
    tokens.forEach((tok, i) => {
      const [midi, beats, vel] = spec[i];
      const syl = tok === '_' ? null : tok;
      if (syl && prev) link(prev, syl);
      sc.notes.push({ t0: b * sc.spb(), t1: (b + beats) * sc.spb(), midi, flags: '', syl, velocity: vel, phrase: sc.phrase, idx: 0, params: {} });
      if (syl) prev = syl;
      b += beats;
    });
    sc.phrase++; sc.cursor = b;
    return sc;
  }
  function announceScore(text, voice = 'arena', start = 0.45) {
    const spk = SP.announcers[voice];
    const sc = new Score(60, null);
    let t = start;
    for (const [chunk, boundary] of splitPhrases(normalizeText(text))) {
      const { out, guessed, words } = prosody(chunk, boundary, spk);
      sc.guessed.push(...guessed); sc.words.push(...words);
      if (!out.length) continue;
      const tokens = [], spec = [];
      for (const x of out) {
        if (Math.abs(x.b - x.a) >= 1.0) { tokens.push(x.syl, '_'); spec.push([x.a, 0.35 * x.dur, x.vel], [x.b, 0.65 * x.dur, x.vel]); }
        else { tokens.push(x.syl); spec.push([x.a, x.dur, x.vel]); }
      }
      addTokens(sc, tokens, spec, t);
      t += spec.reduce((a, x) => a + x[1], 0) + SP.pause[boundary] * spk.rate;
    }
    return sc;
  }
  function renderAnnouncement(text, voice = 'arena', { seed = 1, tune = null, key = null, octave = 0, genShift = 0, sr = 44100 } = {}) {
    const spk = SP.announcers[voice];
    tune = tune || spk.tune || 'off';
    const sc = announceScore(text, voice);
    sc.key = key || spk.key || null;
    if (octave) sc.notes.forEach(n => { n.midi += 12 * octave; });
    const B = makeBank(spk.bank, genShift ? { GEN: (Object.assign({}, D.bank_default, D.banks[spk.bank]).GEN) + genShift } : {});
    const r = render(sc, { style: spk.style, tune, seed, bank: B, sr, firstBreath: false });
    r.score = sc;
    return r;
  }

  root.VoiceEngine = { Score, render, plan, makeBank, link, syllabify, announceScore, renderAnnouncement, speech: D.speech, normalizeText, parseLyrics, parseNotes, wordToPhones, keyPcs, styles: D.styles, tunes: D.tunes, banks: D.banks, lfTable };
})(typeof window !== 'undefined' ? window : globalThis);
