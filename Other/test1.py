import xmltodict

# Считываем XML файл
with open('xmlfile.xml', 'r', encoding='utf-8') as file:
    xml_data = file.read()

# Преобразуем XML в Python-объект
data = xmltodict.parse(xml_data)

# Пример доступа к данным
print("\nПреобразованный объект:")
print(data.get('NOTATKI'))


# from fillpdf import fillpdfs
# form_fields = list(fillpdfs.get_form_fields("czysty_wniosek.pdf").keys())
# form_values = fillpdfs.get_form_fields("czysty_wniosek.pdf").values()

# # #-------------------------------------variables-------------------------------------#
# marka = 'mazda'
# numer = '123'
# data = '23.01.2934'
# godzina = '12:07'
# miejsce = 'ul Konarskiego'

# information = 'POJAZD MARKI: '+marka+'\nNUMER REJESTRACYJNY: '+numer+'\nDATA ZDARZENIA: '+data+', GODZ. '+godzina+'\nMIEJSCE ZDARZENIA: '+miejsce
# day = '01'
# month = '10'
# year = '2004'
# data_to_fill = {}
# data_to_fill[form_fields[18]] = information
# data_to_fill[form_fields[42]] = year
# data_to_fill[form_fields[41]] = month
# data_to_fill[form_fields[40]] = day
# # # #-------------------------------------variables-------------------------------------#
# fillpdfs.write_fillable_pdf('formularz.pdf','wwniosek.pdf',data_to_fill)


# # #-------------------------------------DATA-------------------------------------#
# #---------------------Page: 1:---------------------#
# lista = {
#     "sname" : "Imię i nazwisko",#1#
#     "fio" : "Firma, instytucja lub organ",#2#
#     "id" : "Nr identyfikacyjny",#3#
#     "number" : "Nr telefonu",#4#
#     "pelnomocnik" : "Pełnomocnik",#5#
#     "street" : "Ulica",#6#
#     "ndom" : "Numer domu",#7#
#     "nlokal" : "Numer lokalu",#8#
#     "kod2" : "12",#9#
#     "kod3" : "345",#10#
#     "city" : "Miejscowość",#11#
#     "country" : "Państwo",#12#
#     "check1_jwp" : 'Tak',  #"Jestem właścicielem, posiadaczem lub użytkownikiem pojazdu",#13#
#     "check2_wwi" : 'Tak', #"Wnioskuję w imieniu organu lub instytucji",#14#
#     "uknown" : 'Tak',#15# uknown
#     "uknown2" : 'Tak', #16# ulnown2
#     "sygpos" : "Sygnatura",#17#Sygnatura postępowania
#     "cel" : 'Cel',#18# Cel udostępnienia albo przekazania danych 
#     "information" : "Informacje umożliwiające wyszukanie danych",#19#
#     "numer" : 'Tak', #20# nr rejestracyjny
#     "typ":"Tak",#21# marka, typ, model (nazwa handlowa)
#     "vin" : "Tak",#22# nr VIN albo nr nadwozia (podwozia) lub ramy pojazdu
#     "year" : "Tak",#23# rok produkcji
#     "data" : "Tak",#24# data pierwszej rejestracji w kraju
#     "data2" :"Tak",#25#data pierwszej rejestracji za granicą
#     "moc":"Tak",#26#pojemność i moc silnika
#     "check7_wod" : 'Tak',
# }
# print(lista)
#---------------------Page: 2:---------------------#
    # "information" : "Informacje umożliwiające wyszukanie danych",#17#
    # "numbere" : "nr  ejestracyjny",#18#
    # "nazwa":"marka, typ, model (nazwa handlowa)",#19#
    # "vin" : "nr VIN albo nr nadwozia (podwozia) lub ramy pojazdu",#20#
    # "year" : "rok produkcji",#21#
    # 
    # 
    # 
    # "rodzaj":"rodzaj pojazdu",#25#
    # "masa" :"dopuszczalna masa całkowita",#26#
    # "dane" : "inne dane (wpisz, jakie są Ci potrzebne)",#27#
    # "liczba" : "liczba osi",#28#
    # "imiejsc" :"liczba miejsc: ogółem, siedzących, stojących", #29#
    # "organ" : "oznaczenie organu wydającego dowód rejestracyjny lub jego wtórnik",#30#
# ="seria i nr dowodu rejestracyjnego albo pozwolenia czasowego oraz data ich wydania lub ich wtórników"#31#
# ="seria i nr karty pojazdu lub jej wtórnika"#32#
# ="dane właściciela, posiadacza oraz użytkownika pojazdu użytkowanego na podstawie umowy leasingu"#33#
# ="Inne dane (wpisz, jakie są potrzebne)"#34#
# ="dowód opłaty"#35#
# ="dokument lub dokumenty potwierdzające interes prawny"#36#
# ="inne dokumenty (wpisz jakie)"#37#
# ="Inne dokumenty (wpisz jakie)"#38#
# ="dd"#39#
# ="mm"#40#
# ="rrrr"#41#
# }
# i = 0
# data_to_fill = {}
# for value in lista:
#     data_to_fill[form_fields[i]] = lista[value],
#     i = i+1
#-------------------------------------DATA-------------------------------------#

# if "/Annots" in page:
#     for annot in page["/Annots"]:
#         annot_obj = annot.get_object()

#         # Проверяем, является ли это полем формы
#         if "/T" in annot_obj:
#             field_name = annot_obj["/T"]
#            # print(f"Обрабатываю поле: {field_name}")
#             if field_name in data_to_fill:
#                 # print(type("\V"))
#                 # print(type(data_to_fill[field_name]))
#                 annot_obj.update({
#                     "/V": data_to_fill[field_name]  # Заполнение поля
#                 })    

# output_pdf_path = "filled_form.pdf"
# reader = PdfReader(pdfpath) 
# writer = PdfWriter()
# data_to_fill = {
#     "Imię i nazwisko": "Jorg Washo",
#     "Firma, instytucja lub organ": "Hahsdj",
#     "Nr identyfikacyjny": "1236",
#     "Nr telefonu": "+263748",
#     # "Pełnomocnik": "",
#     # "Ulica": "",
#     # "Numer domu": "",
#     # "Numer lokalu": "",
#     # "Kod pocztowy 01": "",
#     # "Kod pocztowy 02": "",
#     # "Miejscowość": "",
#     # "Państwo": "",
#     # "Jestem właścicielem, posiadaczem lub użytkownikiem pojazdu": "",
#     # "Wnioskuję w imieniu organu lub instytucji": "",
#     # "Sygnatura postępowania": "",
#     # "Podaj cel udostępniania albo przekazania danych": "",
# }
# page = reader.pages[0]
# if "/Annots" in page: #our fields
#     for annot in page["/Annots"]:
#         annot_obj = annot.get_object()
#         if "/T" in annot_obj:  # check if field has a name("/T" - name of field)
#             field_name = annot_obj["/T"]
#             if field_name in data_to_fill:
#                 annot_obj.update({
#                     "/V": data_to_fill[field_name]  # update the field
#                 })
#             else:
#                 print('No such field name')
#             # print("\""+f"{field_name}"+"\": \"\",")
#     # print("-" * 40)  
# else:
#     print("NO FIELD")
# writer.add_page(page) #add new page 
# with open(output_pdf_path, "wb") as output_file: #write new file
#     writer.write(output_file)        



# from PyPDF2 import PdfReader, PdfWriter
# pdfpath = "czysty_wniosek.pdf"
# reader = PdfReader(pdfpath)
# writer = PdfWriter()
# count = 1 
# for page_number, page in enumerate(reader.pages, start=1): #enumeration of pages
#     if "/Annots" in page: #our fields
#         print("#---------------------"+f"Page: {page_number}:"+"---------------------#") #number of page
#         for annot in page["/Annots"]:
#             annot_obj = annot.get_object()
#             if "/T" in annot_obj:  # check if field has a name("/T" - name of field)
#                 field_name = annot_obj["/T"]
#                 field_value = annot_obj.get("/V", "BRAK")
#                 print(f"{field_name}"+" "+f"{field_value}"#+"\',#"+f"{count}#
#                 )
#                 count=count+1  
#     else:
#         print("NO FIELD")
# fields = reader.get_form_text_fields()
# for field in fields:
#     print(field+"\n")

# variables = list(
#     name = "Alexsander",
#     pelnomocnik = None,
#     street = "Konaskiego",
#     country = "Polska",
#     city = "Warszawa",
#     firma = None,
#     ID = 123543,
#     numner = "+48881473287",
#     ndom = 13,
#     nlokal = 58,
#     sygnature = "cos tam",


# )

# page1 = reader.pages[0]
# page2 = reader.pages[1]
# writer.add_page(page1)
# tak = '/Tak'
# writer.add_page(page2)
# writer.update_page_form_field_values(
#     writer.pages[0], {
#         #---------------------Page: 1:---------------------#
#         'Imię i nazwisko' : 'BRAK',#1
#         'Firma, instytucja lub organ' : 'BRAK',#2
#         'Nr identyfikacyjny' : 'BRAK',#3
#         'Nr telefonu' : 'BRAK',#4
#         'Pełnomocnik' : 'BRAK',#5
#         'Ulica' : 'BRAK',#6
#         'Numer domu' : 'BRAK',#7
#         'Numer lokalu' : 'BRAK',#8
#         'Kod pocztowy 01' : 'BRAK',#9
#         'Kod pocztowy 02' : 'BRAK',#10
#         'Miejscowość' : 'BRAK',#11
#         'Państwo' : 'BRAK',#12
#         'Jestem właścicielem, posiadaczem lub użytkownikiem pojazdu (również na podstawie umowy leasingu)' : 'Tak',#13
#         'Wnioskuję w imieniu organu lub instytucji' : 'Tak',#14
#         'Mam udokumentowany interes prawny w uzyskaniu danych (np. sądowynakaz zapłaty, wyrok)' : 'Tak',#15
#         'Wnioskuję o dane dla celów komercyjnych i niekomercyjnych (np. statystyczne)' : 'Tak',#16
#         'Sygnatura postępowania' : 'BRAK',#17
#         'Podaj cel udostępniania albo przekazania danych' : 'scd',
#     } 
# )
# # writer.update_page_form_field_values(   
# #     writer.pages[1], {
# #         #---------------------Page: 2:---------------------#
# #         'Informacje umożliwiające wyszukanie danych' : '',
# #         'nr rejestracyjny' : 'BRAK',#20
# #         'marka, typ, model (nazwa handlowa)' : 'BRAK',#21
# #         'nr VIN albo nr nadwozia (podwozia) lub ramy pojazdu' : 'BRAK',#22
# #         'rok produkcji' : 'BRAK',#23
# #         'data pierwszej rejestracji w kraju' : 'BRAK',#24
# #         'data pierwszej rejestracji za granicą' : 'BRAK',#25
# #         'pojemność i moc silnika' : 'BRAK',#26
# #         'rodzaj pojazdu' : 'BRAK',#27
# #         'dopuszczalna masa całkowita' : 'BRAK',#28
# #         'inne dane (wpisz, jakie są Ci potrzebne)' : 'BRAK',#29
# #         'liczba osi' : 'BRAK',#30
# #         'liczba miejsc: ogółem, siedzących, stojących' : 'BRAK',#31
# #         'oznaczenie organu wydającego dowód rejestracyjny lub jego wtórnik' : 'BRAK',#32
# #         'seria i nr dowodu rejestracyjnego albo pozwolenia czasowego oraz data ich wydania lub ich wtórników' : 'BRAK',#33
# #         'seria i nr karty pojazdu lub jej wtórnika' : 'BRAK',#34
# #         'dane właściciela, posiadacza oraz użytkownika pojazdu użytkowanego na podstawie umowy leasingu' : 'BRAK',#35
# #         'Inne dane (wpisz, jakie są potrzebne)' : 'BRAK',#36
# #         'dowód opłaty' : 'BRAK',#37
# #         'dokument lub dokumenty potwierdzające interes prawny' : 'BRAK',#38
# #         'inne dokumenty (wpisz jakie)' : 'BRAK',#39
# #         'Inne dokumenty (wpisz jakie)' : 'BRAK',#40
# #         'dd' : 'BRAK',#41
# #         'mm' : 'BRAK',#42
# #         'rrrr' : 'BRAK',#43
# #     }
# # )
# # write "output" to PyPDF2-output.pdf
# with open("filled-out.pdf", "wb") as output_stream:
#     writer.write(output_stream)