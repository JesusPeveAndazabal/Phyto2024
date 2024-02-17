/*
   THESE PARAMETERS MUST BE EQUALS WITH PYTHON SCRIPT'S ENUM:
     MODE OPTIONS:
       ONLY_READ = 1
       ONLY_WRITE = 2
       READ_WRITE = 3

     SENSORS AND ACTUATORS:
       SPEED = 1
       WATER_FLOW = 2
       PRESSURE = 3
       GPS = 4
       VOLUME = 5

       VALVE_LEFT = 20
       VALVE_RIGHT = 21
       REGULARDOR = 22
       PINES PARA Controlador A1 Regulador Presion
       #define AIN1 = 2;
       #define AIN2 = 3;
       // #define AENA = 4;

       PINES PARA Controlador A2 Regulador Presion
       #define AIN3 = 4;
       #define AIN4 = 5;
       // #define AENB = 7;

       PINES PARA Controlador B1 Valvulas
       #define BIN1 = 6;
       #define BIN2 = 7;
       // #define BENA = 10;

       PINES PARA Controlador B2 Valvulas
       #define BIN3 = 8;
       #define BIN4 = 9;
       // #define BENB = 13;
*/

/*Here Define Parameters*/
const int MODE = 1;
const int SENSORS[] = { 2,5 };  // Can be multiple (separate by comma), ¡FIRST DEFINE SENSORS THEN ACTUATORS!
float SENSORS_VALUES[] = { 0.00, 0.00 };    // Status of SENSORS (OUPUT ONLY) (MUST BE SAME LENGTH THAN SENSORS ARRAY)
String command[2];
bool isConfigAcepted = false;
int delayMS = 0;

int FLOW_PIN = 2;
float FLOW_RATE;
volatile float COUNT;
float FLOW_CONSTANTE = 4.15;  // 1 L / 250 pulsos segun especificacion de fabricante * 1000 mL | Este valor es solo proporcionado por el fabricante pero puede variar
float WATER_FLOW_MEASURE;

void setup() {
  Serial.begin(115200);
  pinMode(FLOW_PIN, INPUT);
  attachInterrupt(0, FLOW, RISING);

  String sensors = "";
  for (int i= 0; i < sizeof(SENSORS) /sizeof(int); i++)
  {
    sensors = sensors + ""+ String(SENSORS[i])+ ",";
  }
  sensors = sensors.substring(0,sensors.length() - 1);
  Serial.println("C|"+String(MODE)+"|"+sensors);

  //Wait for Raspberry confirmation...
  while(!isConfigAcepted){
    if(Serial.available()){
      isConfigAcepted = Serial.readStringUntil('\n') == "OK";
      
    }
  }
  
}

unsigned long lastMillis = 0 ;
unsigned long currentMillis = 0;


void loop() {
  if(lastMillis == 0){
    lastMillis = millis();
  }

  unsigned long diff = abs(currentMillis - lastMillis);
  
  COUNT = 0;
  interrupts();
  delay(1000);
  noInterrupts();

  FLOW_RATE = (COUNT * FLOW_CONSTANTE);
  WATER_FLOW_MEASURE = FLOW_RATE;
  FLOW_RATE = FLOW_RATE * 60.00;
  FLOW_RATE = FLOW_RATE / 1000.00;

  SENSORS_VALUES[0] = FLOW_RATE;
  SENSORS_VALUES[1] = WATER_FLOW_MEASURE / 1000.00;

//  Serial.print("FLOWRATE: ");Serial.print(FLOW_RATE, 1);Serial.println(' l/m');
//  Serial.print("WATERFLOW: ");Serial.print(WATER_FLOW_MEASURE, 1);Serial.println(' ml/pulso');
  
  //if(diff > delayMS){
    String value_sensors = "";
    for (int i= 0; i < sizeof(SENSORS) /sizeof(int); i++)
    {
      value_sensors = value_sensors + String(SENSORS_VALUES[i])+"|";
    }
    value_sensors = value_sensors.substring(0,value_sensors.length() - 1);
    Serial.println(value_sensors);
    lastMillis = millis();
  //}

  currentMillis = millis();
}

/* METHODS AND FUNCTIONS */
void split(String str,char separator){
  int StringCount = 0;
  while (str.length() > 0)
  {
    int index = str.indexOf(separator);
    if (index == -1) // No separator found
    {
      command[StringCount++] = str;
      break;
    }
    else
    {
      command[StringCount++] = str.substring(0, index);
      str = str.substring(index+1);
    }
  }
}

void FLOW() {
  COUNT++;
}
