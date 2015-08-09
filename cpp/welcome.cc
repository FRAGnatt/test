/*
 */

#include <iostream>
#include <fstream>

using namespace std;
int main(int argc, char**argv) {
    // Prints welcome message...
    size_t size = 0; // here
    cout << "Welcome ..." << std::endl;
    char djembeBuff;
    char metronomeBuff;
    union {
        char c[2];
        short int si;
    } djembeData;
    union {
        char c[2];
        short int si;
    } metronomeData;
    union {
        char c[2];
        short int si;
    } result;
    
    ifstream djembe("C:/djembe-loCustom.wav", ios::binary);
    ifstream metronome("C:/metronomeupCustom.wav", ios::binary);
    ofstream newSound("C:/newsound.wav", ios::binary);    
    for (long i = 0; i < 40; i++) { // смещаем указатель до позиции с данными
        djembe.read(&djembeBuff, 1); // считали первое слово из файла            
        metronome.read(&metronomeBuff, 1); // считали первое слово из файла             
        newSound << metronomeBuff;
    }
    for (long i = 40; i < (106120); i++) {
        djembe.read(djembeData.c, 2); // считали первое слово из файла            
        metronome.read(metronomeData.c, 2); // считали первое слово из файла     
//        result.si = (djembeData.si * metronomeData.si) / 32768;
        result.si = (djembeData.si + metronomeData.si) - ((djembeData.si * metronomeData.si) / 65536);
        newSound << result.c[0];
        newSound << result.c[1];
    }
    djembe.close(); // закрываем файл    
    metronome.close(); // закрываем файл  
    newSound.close();
    return 0;
}
