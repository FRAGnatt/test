/*
 */

#include <iostream>
#include <fstream>

using namespace std;
int main(int argc, char**argv) {
    // Prints welcome message...
    size_t size = 0; // here
    cout << "Welcome ..." << std::endl;
    char djembeBuff[106121];
    char metronomeBuff[106121];
    ifstream djembe("C:/djembe-loCustom.wav", ios::binary);
    ifstream metronome("C:/metronomeupCustom.wav", ios::binary);
    ofstream newSound("C:/newsound.wav", ios::binary);    
    for (long i = 0; i < 40; i++) { // смещаем указатель до позиции с данными
        djembe.get(djembeBuff[i]); // считали первое слово из файла            
        metronome.get(metronomeBuff[i]); // считали первое слово из файла             
        newSound << metronomeBuff[i];
    }
    for (long i = 40; i < (106120); i++) {
        djembe.get(djembeBuff[i]); // считали первое слово из файла            
        metronome.get(metronomeBuff[i]); // считали первое слово из файла             
        newSound << metronomeBuff[i];
    }
    djembe.close(); // закрываем файл    
    metronome.close(); // закрываем файл  
    newSound.close();
    return 0;
}
